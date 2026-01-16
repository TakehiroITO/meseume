from django.urls import path
from .views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', WorkListCreateView.as_view(), name='artwork-list-create'),
    path('<int:pk>/', WorkDetailView.as_view(), name='artwork-detail'),
    path('my/', MemberArtworkListView.as_view(), name='member-artwork-list'),
    path('member/<int:member_id>/', MemberSpecificArtworkListView.as_view(), name='specific-member-artwork-list'),
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('<int:work_id>/like/', LikeWorkView.as_view(), name='like-work'),
    path('<int:work_id>/unlike/', UnlikeWorkView.as_view(), name='unlike-work'),
    path('my-collection/', MyCollectionView.as_view(), name='my-collection'),
    path('family-gallery/', SiblingGalleryView.as_view(), name='family-gallery'),
    path('<int:pk>/delete/', WorkDeleteView.as_view(), name='artwork-delete'),
    path('<int:pk>/update/', WorkUpdateView.as_view(), name='artwork-update'),    
    ]
