from django.urls import path
from .views import AdvertisementListView, AdvertisementDetailView, CreateAdvertisementView

urlpatterns = [
    path('', AdvertisementListView.as_view(), name='advertisement-list'),  # List advertisements
    path('<int:pk>/', AdvertisementDetailView.as_view(), name='advertisement-detail'),  # Details/Edit
    path('create/', CreateAdvertisementView.as_view(), name='advertisement-create'),  # Create new ad
]
