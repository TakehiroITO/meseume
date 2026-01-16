from django.urls import path
from .views import PlanListView, CreateCheckoutSessionView, SubscriptionStatusView, CancelSubscriptionView, stripe_webhook, UserImageCountView

urlpatterns = [
    path('plans/', PlanListView.as_view(), name='plan_list'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create_checkout_session'),
    path('subscription-status/', SubscriptionStatusView.as_view(), name='subscription_status'),
    path('cancel-subscription/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    path('user-image-count/', UserImageCountView.as_view(), name='user_image_count'),
    path('webhook/', stripe_webhook, name='stripe_webhook'),
]
