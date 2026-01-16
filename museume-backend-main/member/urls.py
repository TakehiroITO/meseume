from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # URL for obtaining tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # URL for refreshing tokens
    path('register-profile/', RegisterProfileView.as_view(), name='profile'),
    path('profile/', ProfileDetailView.as_view(), name='profile_detail'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profiles/', ProfileListView.as_view(), name='profile_list'),  # URL for listing children
    path('profiles/<int:pk>/', SingleProfileView.as_view(), name='single_profile_detail'),
    path('account-info/', AccountInfoView.as_view(), name='account-info'),
    path('profile/login/', ProfileLoginView.as_view(), name='profile-login'),
    path('organizations/', OrganizationListView.as_view(), name='organization-list'),
    path('organizations/<str:organization_code>/', OrganizationDetailAPIView.as_view(), name='organization-detail'),
    path('account/delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('profiles/<int:pk>/delete/', DeleteProfileView.as_view(), name='delete-profile')
]
