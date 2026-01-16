import traceback
from rest_framework import generics, status
from .serializers import PlanSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import gettext as _
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Subscription, Plan
from dotenv import load_dotenv
import stripe
import os
try:
    from work.models import Image
except ImportError:
    # Fallback if work app is not available
    Image = None

load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
Member = get_user_model()

# List all available subscription plans
class PlanListView(generics.ListAPIView):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

# Check the subscription status of the currently authenticated user
class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Check parent's subscription if user is a child
        if request.user.role == 'child' and request.user.parent:
            subscription = Subscription.objects.filter(member=request.user.parent, active=True).first()
        else:
            subscription = Subscription.objects.filter(member=request.user, active=True).first()
        
        if subscription:
            return Response({
                'active': True,
                'plan': {
                    'id': subscription.plan.id,
                    'name': subscription.plan.name,
                    'amount': subscription.plan.amount,
                    'currency': subscription.plan.currency,
                    'interval': subscription.plan.interval,
                    'features': subscription.plan.features,
                }
            })
        return Response({'active': False})

# Create a Stripe Checkout session for a subscription
class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        if request.user.role != 'protector':
            return Response(
                {'error': 'Only Protectors can create a payment session.'},
                status=status.HTTP_403_FORBIDDEN
            )

        plan_id = request.data.get('planId')
        plan = Plan.objects.get(id=plan_id)

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': plan.stripe_price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=os.getenv('STRIPE_SUCCESS_URL'),
                cancel_url=os.getenv('STRIPE_CANCELLED_URL'),
                customer_email=request.user.email,
                metadata={'plan_id': plan.stripe_price_id}
            )
            return Response({'url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Cancel an active subscription for the currently authenticated user
class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        if request.user.role != 'protector':
            return Response(
                {'errors': _('Only Protectors can cancel a subscription.')},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            member = request.user
            subscription = Subscription.objects.get(member=member, active=True)
            stripe.Subscription.delete(subscription.stripe_subscription_id)
            subscription.active = False
            subscription.save()
            return Response({'status': _('subscription cancelled')}, status=status.HTTP_200_OK)
        except Subscription.DoesNotExist:
            return Response({'errors': _('No active subscription found')}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'errors': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Handle Stripe webhook events
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    print(payload)
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None
    stripe_webhook_secret=os.getenv('STRIPE_WEBHOOK_SECRET')
    print("stripe webhook secret:::::::", stripe_webhook_secret)
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, stripe_webhook_secret,#settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

    print(f"EVENT: {event['type']}, {event['id']}")
    try:
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            customer_email = session['customer_email']
            member = Member.objects.get(email=customer_email, role='protector')
            stripe_customer_id = session['customer']
            print("stripe cust id::", stripe_customer_id)
            stripe_subscription_id = session['subscription']
            plan_id = session['metadata']['plan_id']
            plan = Plan.objects.get(stripe_price_id=plan_id)

            member_subscription = Subscription.objects.filter(member=member).first()
            if member_subscription:
                member_subscription.stripe_customer_id = stripe_customer_id
                member_subscription.stripe_subscription_id = stripe_subscription_id
                member_subscription.plan = plan
                member_subscription.active = True
                member_subscription.save()
            else:
                Subscription.objects.create(
                    member=member,
                    stripe_customer_id=stripe_customer_id,
                    stripe_subscription_id=stripe_subscription_id,
                    plan=plan,
                    active=True
                )
            member.save()

        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            stripe_subscription_id = invoice['subscription']
            subscription = Subscription.objects.filter(stripe_subscription_id=stripe_subscription_id).first()
            subscription.active = True
            subscription.save()
            
            plan = subscription.plan
            member = subscription.member
            member.save()

        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            stripe_subscription_id = invoice['subscription']
            subscription = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            subscription.active = False
            subscription.save()

        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            stripe_subscription_id = subscription['id']
            sub = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            sub.active = False
            sub.save()

        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            stripe_subscription_id = subscription['id']
            sub = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            if subscription['status'] == 'active':
                sub.active = True
            else:
                sub.active = False
            sub.save()

        return HttpResponse(status=status.HTTP_200_OK)
    except Exception as e:
        print(f"EVENT: {event}")
        print(f"Error: {e}")
        traceback.print_exc()
        return HttpResponse(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Get user's total image count for subscription limit checking
class UserImageCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Check if Image model is available
            if not Image:
                return Response({
                    'total_images': 0,
                    'subscription_active': False,
                    'is_premium': False,
                    'limit_reached': False,
                    'max_images': 50,
                    'error': 'Image counting not available'
                })
            
            # Count total images uploaded by the user
            print(f"Counting images for user: {request.user.username} (role: {request.user.role})")
            total_images = Image.objects.filter(work__member=request.user).count()
            print(f"Total images found: {total_images}")
            
            # Get subscription status - check parent's subscription if user is a child
            if request.user.role == 'child' and request.user.parent:
                subscription = Subscription.objects.filter(member=request.user.parent, active=True).first()
                print(f"Child user - checking parent's subscription: {request.user.parent.email}")
            else:
                subscription = Subscription.objects.filter(member=request.user, active=True).first()
            
            response_data = {
                'total_images': total_images,
                'subscription_active': bool(subscription),
                'is_premium': subscription and subscription.plan.amount > 0 if subscription else False,
                'limit_reached': False
            }
            
            # Check if free user has reached limit
            if not subscription or subscription.plan.amount == 0:
                response_data['limit_reached'] = total_images >= 50
                response_data['max_images'] = 50
            else:
                response_data['max_images'] = None  # Unlimited for premium
            
            return Response(response_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
