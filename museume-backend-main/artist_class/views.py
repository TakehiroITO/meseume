from rest_framework import generics, status
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from museum_app.permissions import IsChild
from .filters import ArtistClassFilter
from .models import ArtistClass, MemberClassSignup, Payment
from .serializers import ArtistClassSerializer, MemberClassSignupSerializer, PaymentSerializer
from .pagination import CustomPageNumberPagination
from member.helpers.emails import send_email
from django.utils.translation import gettext as _
from django.utils.decorators import method_decorator
import os
import stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')



class ArtistClassListView(generics.ListAPIView):
    serializer_class = ArtistClassSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = ArtistClassFilter
    search_fields = ['name', 'category']
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        queryset = ArtistClass.objects.all()
        return queryset
    
class MyArtistClassListView(generics.ListAPIView):
   permission_classes = [IsChild]
   serializer_class = ArtistClassSerializer 
   filter_backends = [DjangoFilterBackend, SearchFilter]
   filterset_class = ArtistClassFilter
   search_fields = ['name', 'category']
   pagination_class = CustomPageNumberPagination

   def get_queryset(self):
       from django.db.models import Q
       user = self.request.user
       
       # 無料クラスまたは決済完了済みクラスを表示
       return ArtistClass.objects.filter(
           Q(signups__member=user, signups__status='confirmed') |  # 確認済み申込
           Q(payments__member=user, payments__status='succeeded')  # 決済完了済み
       ).distinct()


class ArtistClassDetailView(generics.RetrieveAPIView):
    #permission_classes = [IsChild]
    queryset = ArtistClass.objects.all()
    serializer_class = ArtistClassSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        try:
            # Get member signup status for this class if it exists
            member_signup = MemberClassSignup.objects.filter(
                member=request.user,
                artist_class=instance,
                status='confirmed',
            ).first()
        except:
            member_signup = None

        # Add signup info to response
        data['member_signup'] = {
            'is_signed_up': member_signup is not None,
            'status': member_signup.status if member_signup else None,
            'signed_up_at': member_signup.signed_up_at if member_signup else None
        }
        if not member_signup:
            data['url'] = ''

        return Response(data)

class ClassSignupView(APIView):
    permission_classes = [IsChild]

    def post(self, request, *args, **kwargs):
        artist_class_id = request.data.get('artist_class')

        if not artist_class_id:
            return Response({"error": "artist_class_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            artist_class = ArtistClass.objects.get(id=artist_class_id)
        except ArtistClass.DoesNotExist:
            return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

        if artist_class.is_free or (artist_class.cost is None or artist_class.cost == 0):
            # Possibly just mark it as "SUCCEEDED" or handle differently
            payment = Payment.objects.create(
                member=request.user,
                artist_class=artist_class,
                amount=0,
                status=Payment.SUCCEEDED,
            )
            
            serializer = MemberClassSignupSerializer(data=request.data)
            if serializer.is_valid():
                signup = serializer.save(member=request.user, status='confirmed')
                response_data = {
                    "message": _("Successfully Signed up for the class"),
                    "data": serializer.data,
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        existing_payment = Payment.objects.filter(
            member=request.user,
            artist_class=artist_class
        ).order_by('-created_at').first()

        if existing_payment:
            if existing_payment.status == Payment.SUCCEEDED:
                return Response({"message": _("You are already signed up for this class.")}, status=status.HTTP_400_BAD_REQUEST)
            elif existing_payment.status == Payment.PENDING:
                # 新しい修正: 価格または通貨が変更されている場合の処理
                try:
                    # 現在のStripe Payment Intentを取得
                    payment_intent = stripe.PaymentIntent.retrieve(existing_payment.stripe_payment_intent_id)
                    
                    # 通貨に応じて金額を計算
                    if artist_class.currency == 'USD':
                        new_amount = int(artist_class.cost * 100)
                    else:  # JPY
                        new_amount = int(artist_class.cost)
                    
                    # 金額または通貨が変更されている場合
                    amount_changed = payment_intent.amount != new_amount
                    currency_changed = payment_intent.currency.upper() != artist_class.currency.upper()
                    
                    if amount_changed or currency_changed:
                        if currency_changed:
                            # 通貨が変更された場合は新しいPayment Intentを作成
                            print(f"Currency changed from {payment_intent.currency} to {artist_class.currency}, creating new Payment Intent")
                            
                            # 古いPayment Intentをキャンセル
                            stripe.PaymentIntent.cancel(existing_payment.stripe_payment_intent_id)
                            
                            # 新しいPayment Intentを作成
                            new_payment_intent = stripe.PaymentIntent.create(
                                amount=new_amount,
                                currency=artist_class.currency.lower(),
                                metadata={
                                    "payment_type": "artist_class",
                                    "artist_class_id": str(artist_class_id),
                                    "member_id": str(request.user.id),
                                    "artist_class_name": artist_class.name
                                },
                                description=f"Payment for artist class: {artist_class.name}",
                            )
                            
                            # Payment レコードを更新
                            existing_payment.stripe_payment_intent_id = new_payment_intent.id
                            existing_payment.stripe_payment_intent_secret = new_payment_intent['client_secret']
                            existing_payment.amount = artist_class.cost
                            existing_payment.save()
                            
                            print(f"Created new Payment Intent: {new_payment_intent.id}")
                        else:
                            # 通貨が同じで金額のみ変更の場合
                            stripe.PaymentIntent.modify(
                                existing_payment.stripe_payment_intent_id,
                                amount=new_amount
                            )
                            # ローカルのPaymentレコードも更新
                            existing_payment.amount = artist_class.cost
                            existing_payment.save()
                            print(f"Updated payment intent amount from {payment_intent.amount} to {new_amount}")
                        
                except stripe.error.StripeError as e:
                    print(f"Failed to update payment intent: {e}")
                
                return Response({
                    "payment_intent_client_secret": existing_payment.stripe_payment_intent_secret,
                    "amount": artist_class.cost,
                    "currency": artist_class.currency,
                    "message": _("Payment required. Complete payment to register for the class.")
                }, status=status.HTTP_200_OK)

        try:
            #  - For USD: multiply by 100 (decimal -> cents)
            if artist_class.currency == 'USD':
                amount_in_smallest_unit = int(artist_class.cost * 100)
            else:  # JPY
                amount_in_smallest_unit = int(artist_class.cost)
            print("in not free artist class")

            # Create Stripe Payment Intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_smallest_unit,
                currency=artist_class.currency.lower(),
                metadata={
                    "payment_type": "artist_class",
                    "artist_class_id": str(artist_class_id),  # Convert to string
                    "member_id": str(request.user.id),
                    "artist_class_name": artist_class.name
                },
                description=f"Payment for artist class: {artist_class.name}",
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create Payment record
            payment = Payment.objects.create(
                member=request.user,
                artist_class=artist_class,
                amount=artist_class.cost,
                stripe_payment_intent_id=payment_intent.id,
                stripe_payment_intent_secret=payment_intent['client_secret'],
                status=Payment.PENDING
            )

            # 有料クラスの場合もMemberClassSignupレコードを作成（pending状態）
            MemberClassSignup.objects.get_or_create(
                member=request.user,
                artist_class=artist_class,
                defaults={'status': MemberClassSignup.PENDING}
            )

            print("payment created::::::::::", payment)

            return Response({
                "payment_intent_client_secret": payment_intent['client_secret'],
                "payment_intent_id": payment_intent.id,
                "amount": artist_class.cost,
                "currency": artist_class.currency,
                "signup_id": payment.id,
                "message": _("Payment required. Complete payment to register for the class.")
            }, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = os.getenv('STRIPE_ARTIST_CLASS_WEBHOOK_SECRET')  

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            self.handle_payment_intent_succeeded(payment_intent)
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            self.handle_payment_intent_failed(payment_intent)

        return Response(status=status.HTTP_200_OK)

    def handle_payment_intent_succeeded(self, payment_intent):
        intent_id = payment_intent['id']
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=intent_id)
            payment.status = Payment.SUCCEEDED
            payment.save()
            
            artist_class = payment.artist_class

            # Create or update the class signup
            MemberClassSignup.objects.update_or_create(
                member=payment.member,
                artist_class=artist_class,
                defaults={'status': MemberClassSignup.CONFIRMED}
            )
            
            print(f"Signup updated successfully...")
            
            if artist_class.class_type == ArtistClass.REAL_TIME:
                artist_class = payment.artist_class
                
                # Send email with video URL
                context = {
                    'class_name': artist_class.name,
                    'course_link': artist_class.url,
                }
                print("context:::", context)
                send_email(
                    template_name='emails/artist_class_url.html',
                    subject=f"{artist_class.name}のクラスリンク",
                    context=context,
                    recipient_email=payment.member.parent.email,
                )
                print(f"Video link email sent to {payment.member.parent.email}")
            
        except Payment.DoesNotExist:
            print(f"Payment not found for intent: {intent_id}")
        except Exception as e:
            print(f"Error updating records: {str(e)}")
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def handle_payment_intent_failed(self, payment_intent):
        intent_id = payment_intent['id']
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=intent_id)
            payment.status = Payment.FAILED
            payment.save()
        except Payment.DoesNotExist:
            print(f"Payment not found for intent: {intent_id}")
        except Exception as e:
                print(f"Error updating records: {str(e)}")
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClassRegistrationStatusView(APIView):
    permission_classes = [IsChild]

    def get(self, request, class_id):
        try:
            # Check if the class exists
            artist_class = ArtistClass.objects.get(id=class_id)
        except ArtistClass.DoesNotExist:
            return Response({"errors": _("Class not found.")}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is registered
        try:
            registration = MemberClassSignup.objects.get(member=request.user, artist_class=artist_class)
            response = {
                "registration_status": "registered",
                "payment_status": "paid" if registration.is_paid else "not_paid"
            }
            return Response(response, status=status.HTTP_200_OK)
        except MemberClassSignup.DoesNotExist:
            return Response({
                "registration_status": "not_registered",
                "payment_status": None
            }, status=status.HTTP_200_OK)
        
class VideoUrlView(APIView):
    permission_classes = [IsChild]

    def post(self, request, class_id):
        try:
            artist_class = ArtistClass.objects.get(id=class_id)
            
            # Check if the class is real-time
            # if artist_class.class_type not in ["real_time", "Real Time"]:
            #     return Response({"message": "This class is not a real-time class."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate signup and payment status
            member_signup = MemberClassSignup.objects.filter(
                member=request.user, artist_class=artist_class
            ).first()
            
            if not member_signup:
                return Response({"message": _("このクラスに登録されていません。")}, status=status.HTTP_400_BAD_REQUEST)
            
            # Fetch email from user
            user_email = request.user.parent.email
            if not user_email:
                return Response({"message": _("ユーザーのメールアドレスが利用できません。")}, status=status.HTTP_400_BAD_REQUEST)

            context = {
                'user_name': request.user.username,
                'course_name': artist_class.name,
                'course_link': artist_class.url,
            }
            send_email(
                template_name="emails/artist_class_url.html",
                subject="Artist Class Invite Url",
                context=context,
                recipient_email=user_email,
            )

            return Response({"message": _("ビデオURLをメールで送信しました。"), "url": artist_class.url}, status=status.HTTP_200_OK)

        except ArtistClass.DoesNotExist:
            return Response({"errors": _("クラスが見つかりません。")}, status=status.HTTP_404_NOT_FOUND)


# def stripe_webhook(request):
#     payload = request.body
#     sig_header = request.META['HTTP_STRIPE_SIGNATURE']
#     endpoint_secret = settings.STRIPE_ENDPOINT_SECRET  # Set in settings

#     try:
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, endpoint_secret
#         )
#     except ValueError:
#         return JsonResponse({"error": "Invalid payload"}, status=400)
#     except stripe.error.SignatureVerificationError:
#         return JsonResponse({"error": "Invalid signature"}, status=400)

#     # Handle the event
#     if event['type'] == 'payment_intent.succeeded':
#         payment_intent = event['data']['object']
#         stripe_payment_id = payment_intent['id']

#         # Update payment record
#         try:
#             payment = Payment.objects.get(stripe_payment_intent_id=stripe_payment_id)
#             payment.status = 'succeeded'
#             payment.save()
#         except Payment.DoesNotExist:
#             pass

#     return JsonResponse({"status": "success"}, status=200)

# from rest_framework.views import APIView
# from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# import stripe

class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        payment_intent_id = request.data.get('payment_intent_id')

        if not payment_intent_id:
            return Response({"errors": _("Payment Intent ID is required.")}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the Payment record
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)

            # Verify payment status with Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if payment_intent['status'] != 'succeeded':
                return Response({"errors": _("Payment has not succeeded yet.")}, status=status.HTTP_400_BAD_REQUEST)

            # Update Payment record
            payment.status = 'succeeded'
            payment.save()

            # Create or update MemberClassSignup record
            member_signup, created = MemberClassSignup.objects.update_or_create(
                member=payment.member,
                artist_class=payment.artist_class,
                defaults={
                    'status': MemberClassSignup.CONFIRMED,
                    'signed_up_at': payment.created_at if not created else None
                }
            )
            
            if created:
                print(f"Created new signup record for {payment.member.username}")
            else:
                print(f"Updated existing signup record for {payment.member.username}")

            return Response({"message": _("Payment confirmed and class signup updated successfully.")}, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({"errors": _("Payment record not found.")}, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.StripeError as e:
            return Response({"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"errors": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
