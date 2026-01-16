from rest_framework import serializers
from .models import PublicNavBar

class PublicNavBarSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicNavBar
        fields = ['id', 'url', 'navbar_type', 'created_at', 'updated_at']
