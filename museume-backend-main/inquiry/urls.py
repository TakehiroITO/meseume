from django.urls import path
from .views import InquiryAPIView

urlpatterns = [
    path('', InquiryAPIView.as_view(), name='inquiry-api'),
]
