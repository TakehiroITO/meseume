from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import *
from .serializers import *
from .filters import WorkFilter
from .pagination import CustomPageNumberPagination
from museum_app.permissions import IsChild
from django.utils.translation import gettext as _
from django.db.models import Q

class WorkListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = WorkFilter
    search_fields = ['title', 'description', 'tags__name']
    pagination_class = CustomPageNumberPagination

    def perform_create(self, serializer):
        # If you want to assign the currently authenticated user to the work
        serializer.save(member=self.request.user)

    def get_queryset(self):
        # Use select_related and prefetch_related to avoid N+1 queries
        return Work.objects.filter(is_public=True).select_related(
            'member',
            'category'
        ).prefetch_related(
            'images',
            'tags',
            'likes'
        )

class WorkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkSerializer
    #permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Return the list of artworks uploaded by the current authenticated user.
        Use select_related and prefetch_related to avoid N+1 queries.
        """
        return Work.objects.filter(
            (Q(member=self.request.user) & Q(is_public=False)) | Q(is_public=True)
        ).select_related(
            'member',
            'category'
        ).prefetch_related(
            'images',
            'tags',
            'likes'
        )

class MemberArtworkListView(generics.ListAPIView):
    serializer_class = WorkSerializer
    permission_classes = [IsChild]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = WorkFilter
    search_fields = ['title', 'description', 'tags__name']
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        """
        Return the list of artworks uploaded by the current authenticated user.
        Use select_related and prefetch_related to avoid N+1 queries.
        """
        return Work.objects.filter(member=self.request.user).select_related(
            'member',
            'category'
        ).prefetch_related(
            'images',
            'tags',
            'likes'
        )
      
class MemberSpecificArtworkListView(generics.ListAPIView):
    serializer_class = WorkSerializer
    #permission_classes = [IsAuthenticated]
    permission_classes = [IsChild]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = WorkFilter
    search_fields = ['title', 'description', 'tags__name']
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        """
        Return the list of artworks uploaded by the specified member (by ID or username).
        Use select_related and prefetch_related to avoid N+1 queries.
        """
        member_id = self.kwargs.get('member_id')

        return Work.objects.filter(member__id=member_id, is_public=True).select_related(
            'member',
            'category'
        ).prefetch_related(
            'images',
            'tags',
            'likes'
        )

class MyCollectionView(generics.ListAPIView):
    serializer_class = WorkSerializer
    permission_classes = [IsChild]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = WorkFilter
    search_fields = ['title', 'description', 'tags__name']
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        """
        Return all works liked by the currently authenticated user.
        Use select_related and prefetch_related to avoid N+1 queries.
        """
        # Get the works that the logged-in user has liked
        liked_work_ids = Like.objects.filter(member=self.request.user).values_list('work_id', flat=True)
        return Work.objects.filter(id__in=liked_work_ids).select_related(
            'member',
            'category'
        ).prefetch_related(
            'images',
            'tags',
            'likes'
        )

class LikeWorkView(APIView):
    """
    Like a specific work.
    """
    permission_classes = [IsChild]

    def post(self, request, work_id):
        work = Work.objects.get(id=work_id)
        like, created = Like.objects.get_or_create(member=request.user, work=work)

        if created:
            return Response({"message": _("Liked")}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": _("Already liked")}, status=status.HTTP_200_OK)

class UnlikeWorkView(APIView):
    """
    Unlike a specific work.
    """
    permission_classes = [IsChild]

    def post(self, request, work_id):
        work = Work.objects.get(id=work_id)
        try:
            like = Like.objects.get(member=request.user, work=work)
            like.delete()
            return Response({"message": _("Unliked")}, status=status.HTTP_200_OK)
        except Like.DoesNotExist:
            return Response({"message": _("You haven't liked this work")}, status=status.HTTP_400_BAD_REQUEST)


class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    #permission_classes = [IsAuthenticated]

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('id')
    serializer_class = CategorySerializer
    #permission_classes = [IsAuthenticated]

class SiblingGalleryView(generics.ListAPIView):
   serializer_class = WorkSerializer
   permission_classes = [IsChild]
   filter_backends = [DjangoFilterBackend, SearchFilter]
   filterset_class = WorkFilter
   search_fields = ['title', 'description', 'tags__name']
   pagination_class = CustomPageNumberPagination

   def get_queryset(self):
       """
       Return artworks from shared siblings and current user
       """
       user = self.request.user
       
       # Get siblings that are shared with this user
       siblings = user.get_sibilings().exclude(id=user.id)
       shared_siblings = siblings.filter()
       
       # Add current user to the queryset
       user_ids = list(shared_siblings.values_list('id', flat=True))
       user_ids.append(user.id)
       
       # Get works from shared siblings and current user
       queryset = Work.objects.filter(
           member__id__in=user_ids,
           public_visibility='public', 
           is_public=True,
       ).select_related(
           'member',
           'category'
       ).prefetch_related(
           'images',
           'tags',
           'likes'
       ).order_by('-created_at')

       return queryset

   def get_serializer_context(self):
       context = super().get_serializer_context()
       context['request'] = self.request
       return context

   def list(self, request, *args, **kwargs):
       # Add extra logging to debug the query and results
       queryset = self.get_queryset()
       print(f"Query: {queryset.query}")  # Log the SQL query
       print(f"User IDs included: {[x.member_id for x in queryset]}")  # Log member IDs
       
       return super().list(request, *args, **kwargs)


class WorkDeleteView(generics.DestroyAPIView):
    queryset = Work.objects.all()
    serializer_class = WorkSerializer
    permission_classes = [IsChild]
    
    def get_queryset(self):
        """
        Only allow users to delete their own artwork
        """
        return Work.objects.filter(member=self.request.user)
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": _("Artwork successfully deleted")}, status=status.HTTP_204_NO_CONTENT)


class WorkUpdateView(APIView):
    permission_classes = [IsChild]
    
    def post(self, request, pk, format=None):
        try:
            work = Work.objects.get(id=pk, member=request.user)
        except Work.DoesNotExist:
            return Response({"message": _("Work not found")}, status=status.HTTP_404_NOT_FOUND)

        # Handle basic fields
        if 'title' in request.data:
            work.title = request.data['title']
            
        if 'description' in request.data:
            work.description = request.data['description']
            
        if 'is_public' in request.data:
            is_public_value = request.data['is_public']
            if isinstance(is_public_value, str):
                work.is_public = is_public_value.lower() in ['true', '1', 't', 'y', 'yes']
            else:
                work.is_public = bool(is_public_value)
        
        if 'category' in request.data and request.data['category']:
            try:
                category_id = int(request.data['category'])
                work.category = Category.objects.get(id=category_id)
            except (ValueError, Category.DoesNotExist):
                pass  # Keep the existing category
                
        # Save the work first to apply basic fields
        work.save()
                
        if request.FILES and 'images' in request.FILES:
            try:
                image_files = request.FILES.getlist('images')
                if not image_files:
                    image_files = [request.FILES['images']]
                    
                if image_files:
                    # Delete existing images only if we have new ones
                    work.images.all().delete()
                    
                    # Add new images
                    for img in image_files:
                        if img:
                            try:
                                # Generate hash
                                img.seek(0)
                                image_hash = hashlib.sha256(img.read()).hexdigest()
                                img.seek(0)
                                
                                # Create new image
                                Image.objects.create(
                                    work=work,
                                    image=img,
                                    hash=image_hash
                                )
                            except Exception as img_error:
                                print(f"Error processing image: {img_error}")
            except Exception as img_error:
                print(f"Image handling error: {img_error}")
        
        # Return the updated work
        serializer = WorkSerializer(work, context={'request': request})
        return Response({
            "message": _("Work updated successfully"),
            "id": work.id,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    