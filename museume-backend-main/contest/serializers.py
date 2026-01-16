from rest_framework import serializers
from .models import Contest, ContestApplication
from member.serializers import OrganizationSerializer
from work.serializers import ImageSerializer
from django.utils.translation import gettext as _

class ContestSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    thumbnail = serializers.ImageField(read_only=True)
    entry_history = serializers.SerializerMethodField()
    class Meta:
        model = Contest
        fields = ['id', 'name', 'thumbnail', 'explanation', 'start_date', 'end_date', 'eligibility_criteria', 'is_private', 'organization', 'entry_history', 'winner']

    def get_entry_history(self, obj):
        """
        Return all contest applications for the current user for the given contest.
        """
        member = self.context.get('request').user
        if member and not member.is_anonymous:
            contest_applications = ContestApplication.objects.filter(contest=obj, member=member)
        else:
            contest_applications = []
        return ContestApplicationSerializer(contest_applications, many=True, context=self.context).data

class ContestApplicationSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='work.title', read_only=True)
    work_id = serializers.PrimaryKeyRelatedField(source='work.id', read_only=True)
    #images = ImageSerializer(source='work.images', many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = ContestApplication
        fields = ['id', 'work_id', 'title', 'image', 'submission_date']

    def get_image(self, obj):
        """
        Return only the first image for the work if it exists.
        """
        first_image = obj.work.images.first()
        if first_image:
            request = self.context.get('request')
            if request:
                url = request.build_absolute_uri(first_image.image.url)
                # Force HTTPS in production
                if url.startswith('http://') and (
                    'museume.art' in url or 
                    request.get_host() in ['museume.art', 'www.museume.art']
                ):
                    url = url.replace('http://', 'https://')
                return url
            else:
                return first_image.image.url
        return None

class SubmitWorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestApplication
        fields = ['contest', 'work']  

    def validate(self, data):
        if ContestApplication.objects.filter(contest=data['contest'], work=data['work']).exists():
            raise serializers.ValidationError(_("This work has already been submitted to this contest."))
        return data

    def create(self, validated_data):
        member = self.context['request'].user  
        validated_data['member'] = member
        return super().create(validated_data)
