from rest_framework import serializers
from .models import ArtistClass, MemberClassSignup, Payment
from django.utils import timezone

class ArtistClassSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()  # 新規追加
    
    class Meta:
        model = ArtistClass
        fields = [
            'id', 'name', 'category', 'tags', 'is_free', 'class_type', 'currency',
            'thumbnail', 'url', 'start_date', 'end_date', 'cost', 'description',
            'status'  # 新規追加
        ]
    
    def get_status(self, obj):
        """
        開催状況を返す
        """
        if not obj.start_date or not obj.end_date:
            return 'unknown'
        
        now = timezone.now()
        
        if obj.start_date > now:
            return 'scheduled'
        elif obj.start_date <= now <= obj.end_date:
            return 'ongoing'
        else:
            return 'completed'

class MemberClassSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberClassSignup
        fields = [
            'id', 'member', 'artist_class', 'signed_up_at',
        ]

class VideoUrlRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'member',
            'artist_class',
            'amount',
            'stripe_payment_intent_id',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['stripe_payment_intent_id', 'status', 'created_at', 'updated_at']
