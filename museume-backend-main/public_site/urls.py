from django.urls import path
from .views import *

urlpatterns = [
    path('', PublicNavBarListAPIView.as_view(), name='public-navbar-list'),
]
