import os
from django.conf import settings
from dotenv import load_dotenv
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from member.helpers.emails import send_email
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.translation import gettext as _
from .serializers import SignupSerializer, LoginSerializer, ProfileSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer,  MemberSerializer, AccountInfoSerializer, ProfileDetailSerializer, ProfileLoginSerializer, OrganizationSerializer
from .models import Member, Organization
from .pagination import CustomPageNumberPagination
from rest_framework import filters
from rest_framework.generics import ListAPIView
from museum_app.permissions import IsChild 
from rest_framework import serializers


# Load environment variables
load_dotenv()

class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def perform_create(self, serializer):
        user = serializer.save()
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = os.environ.get('FRONTEND_URL')
        verification_url = f"{frontend_url}verify-email?uid={uid}&token={token}/"

        print(f"Email verification link: {verification_url}")

        # Use get_notification_email for child accounts (sends to parent)
        notification_email = user.get_notification_email()

        context = {
            'user_name': user.first_name or user.username,
            'verification_link': verification_url,
        }
        send_email(
            template_name='emails/email_verification.html',
            subject="Verify Your Email Address",
            context=context,
            recipient_email=notification_email,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Member.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Member.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': _('メールアドレスの認証が完了しました')}, status=status.HTTP_200_OK)
        else:
            return Response({'message': _('無効または期限切れのトークンです')}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return serializer.create_response(serializer.validated_data)
        except serializers.ValidationError as e:  # Corrected here
            # Extract the error message from ValidationError
            errors = e.detail
            if isinstance(errors, dict):
                message = " ".join([" ".join(msgs) for msgs in errors.values()])
            else:
                message = " ".join(errors)
            
            # Return the message in a format that the frontend expects
            return Response({
                "message": message
            }, status=status.HTTP_400_BAD_REQUEST)



class RegisterProfileView(generics.CreateAPIView):
    queryset = Member.objects.filter(role='child')
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()  # The serializer already handles assigning the protector as the parent

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    #queryset = Member.objects.filter(role='child')
    serializer_class = ProfileSerializer
    permission_classes = [IsChild]

    def get_object(self):
        # Get the current logged-in user
        user = self.request.user
        
        # Get the Member instance related to the user
        return Member.objects.get(username=user.username)

class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = Member.objects.get(email=email)

        # Generate token and create password reset link
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        # Get the frontend URL from the environment variable
        frontend_url = os.environ.get('FRONTEND_URL')
        reset_link = f"{frontend_url}password-reset-confirm?uid={uid}&token={token}/"

        print(f"Reset Password link: {reset_link}")

        # Use get_notification_email for child accounts (sends to parent)
        notification_email = user.get_notification_email()

        context = {
            'user_name': user.first_name or user.username,
            'reset_password_link': reset_link,
        }
        send_email(
            template_name='emails/reset_password.html',
            subject="Reset Your Password",
            context=context,
            recipient_email=notification_email,
        )
        return Response({"message": _("パスワードリセットリンクを送信しました。")}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Member.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Member.DoesNotExist):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            return Response({"message": _("Invalid token.")}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.password = make_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"message": _("パスワードがリセットされました。")}, status=status.HTTP_200_OK)
class ProfileListView(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only the children of the authenticated protector
        if self.request.user.role == 'child':
            return Member.objects.filter(parent=self.request.user.parent, role='child')
        return Member.objects.filter(parent=self.request.user, role='child')

class SingleProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only the children of the authenticated protector
        return Member.objects.filter(parent=self.request.user, role='child')
    
    
class AccountInfoView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountInfoSerializer

    def get_object(self):
        # Get the current authenticated user
        return self.request.user
    
class ProfileLoginView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.create_response(), status=status.HTTP_200_OK)
    
class OrganizationListView(ListAPIView):
    permission_classes = [IsChild]
    serializer_class = OrganizationSerializer
    pagination_class = CustomPageNumberPagination
    filter_backends = [filters.SearchFilter]  
    search_fields = ['name']  

    def get_queryset(self):
        return Organization.objects.all()
    
class OrganizationDetailAPIView(APIView):
    permission_classes = [IsChild]

    def get(self, request, organization_code):
        try:
            organization = Organization.objects.get(organization_code=organization_code)
            serializer = OrganizationSerializer(organization)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Organization.DoesNotExist:
            return Response(
                {"errors": _("Invalid code")},
                status=status.HTTP_404_NOT_FOUND
            )

class DeleteProfileView(generics.DestroyAPIView):
   permission_classes = [IsChild]
   serializer_class = ProfileSerializer

   def get_object(self):
       profile_id = self.kwargs.get('pk')
       return get_object_or_404(Member, id=profile_id, parent=self.request.user.parent, role='child')

   def destroy(self, request, *args, **kwargs):
       instance = self.get_object()
       self.perform_destroy(instance)
       return Response({"message": _("アカウントが正常に削除されました")}, status=status.HTTP_200_OK)

class DeleteAccountView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response({"message": _("アカウントが正常に削除されました")}, status=status.HTTP_200_OK)
    