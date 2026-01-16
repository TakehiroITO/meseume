from rest_framework.generics import ListAPIView
from .models import PublicNavBar
from .serializers import PublicNavBarSerializer

class PublicNavBarListAPIView(ListAPIView):
    """
    API view to retrieve the list of PublicNavBar items.
    """
    queryset = PublicNavBar.objects.all()
    serializer_class = PublicNavBarSerializer
