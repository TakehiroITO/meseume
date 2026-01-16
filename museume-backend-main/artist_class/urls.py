from django.urls import path
from .views import ArtistClassListView, ArtistClassDetailView, ClassSignupView, VideoUrlView, ConfirmPaymentView, StripeWebhookView, MyArtistClassListView

urlpatterns = [
    path('', ArtistClassListView.as_view(), name='artist-class-list'),
    path('my-classes/', MyArtistClassListView.as_view(), name='my-artist-classes'),
    path('<int:pk>/', ArtistClassDetailView.as_view(), name='artist-class-detail'),
    path('signup/', ClassSignupView.as_view(), name='class-signup'),
    path('<int:class_id>/video-url/', VideoUrlView.as_view(), name='video-url'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('webhook/', StripeWebhookView.as_view(), name='artist-class-webhook'),
]
