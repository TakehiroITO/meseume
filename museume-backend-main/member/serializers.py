from django.contrib.auth import get_user_model, authenticate
import re
from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework.response import Response
from django.utils.translation import gettext as _
from member.helpers.emails import send_email
from django.utils import timezone
from .models import *
Member = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Member
        fields = ['email', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        # Check if passwords match
        if password != confirm_password:
            raise serializers.ValidationError({"password": _("Passwords do not match.")})

        return attrs

    def validate_password(self, value):
        # Check password length
        if len(value) < 8 or len(value) > 32:
            raise serializers.ValidationError(_("Password must be between 8 and 32 characters."))

        # Check for alphanumeric characters
        if not re.match(r'^[a-zA-Z0-9]+$', value):
            raise serializers.ValidationError(_("Password must contain only alphanumeric characters."))

        # Optionally, check for at least one uppercase, one lowercase, and one number
        if not (re.search(r'[A-Z]', value) and re.search(r'[a-z]', value) and re.search(r'[0-9]', value)):
            raise serializers.ValidationError(_("Password must contain at least one uppercase letter, one lowercase letter, and one number."))

        return value

    def create(self, validated_data):
        # Remove confirm_password from validated_data
        validated_data.pop('confirm_password')

        user = Member.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.is_active = False  # Deactivate account until email confirmation
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError(_("メールアドレスまたはパスワードが正しくありません。"))
            
        if user.role != 'protector':
            raise serializers.ValidationError(_("保護者のみログインが許可されています"))

        access = AccessToken.for_user(user)
        refresh = RefreshToken.for_user(user)

        #send email when a new login is requested
        context = {
            "title": "ログイン通知",
            "login_time": timezone.localtime(timezone.now()),
        }
        send_email(
            template_name="emails/login_notification.html",
            subject="A New Login Detected",
            context=context,
            recipient_email=email,
        )
        # Add user data to the response
        attrs['user'] = user
        attrs['access'] = str(access)
        attrs['refresh'] = str(refresh)
        attrs['role'] = user.role

        return attrs

    def create_response(cls, validated_data):
        return Response({
            'message': _('ログインに成功しました'),
            'access': validated_data['access'],
            'refresh': validated_data['refresh'],
            'role': validated_data['role'],
        })
    
class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'organization_icon']
    
class MemberSerializer(serializers.ModelSerializer):
    is_shared = serializers.SerializerMethodField()
    class Meta:
        model = Member
        fields = ['id', 'username', 'profile_picture', 'is_shared'] 

    def get_is_shared(self, obj):
        user = self.context.get('request').user
        try:
            return obj in user.shared_users.all()
        except:
            return False

class ProfileSerializer(serializers.ModelSerializer):
    organizations = OrganizationSerializer(many=True, read_only=True)
    shared_users = serializers.SerializerMethodField()
    is_logged_in = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Member
        fields = ['id', 'address', 'date_of_birth', 'profile_picture', 'username', 'is_published', 'organizations', 'shared_users', 'is_logged_in']
    
    def get_is_logged_in(self, instance):
        request = self.context.get('request')  # Get request from context
        if request and hasattr(request, 'user') and request.user.role == 'child' and request.user.id == instance.id:
            return True
        return False 
        
    def get_shared_users(self, instance):
        siblings = instance.get_sibilings().exclude(id=instance.id)
        return MemberSerializer(siblings, many=True, context=self.context).data
    
    def create(self, validated_data):
        # Set the role to 'child'
        validated_data['role'] = 'child'

        # Assign the email to the username field
        username = validated_data.get('username')
        validated_data['email'] = f"{username}@museume.com"

        validated_data['username'] = username

        # Associate the protector as the parent
        protector = self.context['request'].user
        validated_data['parent'] = protector

        validated_data['password'] = make_password('66kVj5f@pkr')
        validated_data['is_active'] = True

        organizations = validated_data.pop('organizations', [])
        shared_users = validated_data.pop('shared_users', [])

        child = Member.objects.create(**validated_data)

        child.organizations.set(organizations)
        child.shared_users.set(shared_users)

        if 'profile_picture' in validated_data:
            child.profile_picture = validated_data['profile_picture']
        
        child.save()
        return child
    
    def update(self, instance, validated_data):
        print("validated dtaa::", validated_data)
        # Update all fields directly from validated data
        instance.username = validated_data.get('username')
        instance.address = validated_data.get('address')
        instance.date_of_birth = validated_data.get('date_of_birth')
        #instance.profile_picture = validated_data.get('profile_picture')
        instance.is_published = validated_data.get('is_published')
        
        old_org_ids = set(instance.organizations.values_list('id', flat=True))
        organizations = self.initial_data.get('organizations', None)
        if organizations is not None:
            new_org_ids = set(organizations)
            newly_joined_ids = new_org_ids - old_org_ids  # The difference = newly joined
            
            # Actually set the updated organizations
            instance.organizations.set(organizations)
        else:
            newly_joined_ids = set()  # No org changes if none provided


        shared_users = self.initial_data.get('shared_users', None)
        if shared_users is not None:
            instance.shared_users.set(shared_users)  # Update shared_users only if provided 

        instance.save()
        
        if newly_joined_ids:
            newly_joined_orgs = Organization.objects.filter(id__in=newly_joined_ids)

            for org in newly_joined_orgs:
                # -- A) Email to the Organization --
                org_context = {
                    'organization_name': org.name,
                    'username': instance.username, 
                }
                send_email(
                    template_name='emails/organization_join_notification_to_org.html',
                    subject=f"{instance.username} さんが {org.name} に参加しました",
                    context=org_context,
                    recipient_email=org.email
                )

                # -- B) Email to the User (Child) --
                user_context = {
                    'username': instance.username,
                    'organization_name': org.name,
                }
                send_email(
                    template_name='emails/organization_join_notification_to_user.html',
                    subject=f"{org.name} に参加しました",
                    context=user_context,
                    recipient_email=instance.parent.email
                )
        return instance
        
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            Member.objects.get(email=value)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Email not found.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(_("Passwords do not match."))
        return attrs

    def validate_new_password(self, value):
        # Implement your password validation logic here (length, complexity, etc.)
        if len(value) < 8 or len(value) > 32:
            raise serializers.ValidationError(_("Password must be between 8 and 32 characters."))
        return value
    
class ProfileDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'address', 'email', 'date_of_birth', 'profile_picture']

class AccountInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['email', 'address', 'password', 'first_name']  # Fields that can be updated
        extra_kwargs = {
            'password': {'write_only': True},  # Password should not be readable
        }

    def validate(self, data):
        # Ensure only protectors can update account information
        user = self.context['request'].user
        if user.role != 'protector':
            raise serializers.ValidationError(_("Permission denied. Only protectors can update account information."))

        return data

    def update(self, instance, validated_data):
        # Update email if provided
        if 'email' in validated_data:
            instance.email = validated_data['email']

        # Update address if provided
        if 'address' in validated_data:
            instance.address = validated_data['address']

        # Update name if provided
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']

        # Update password if provided
        if 'password' in validated_data:
            instance.password = make_password(validated_data['password'])  # Hash the password before saving

        # Save updated instance
        instance.save()
        return instance
    
class ProfileLoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')

        # Authenticate the child
        try:
            child = Member.objects.get(username=username, role='child')
        except Member.DoesNotExist:
            raise serializers.ValidationError(_("Profile with this username does not exist."))

        # Get the logged-in user (protector) from the request context
        protector = self.context['request'].user

        # Ensure the logged-in user is a protector
        if protector.role != 'protector':
            raise serializers.ValidationError(_("Only protectors can add a profile."))
        
        # Verify that the child belongs to the logged-in protector
        if child.parent != protector:
            raise serializers.ValidationError(_("プロファイルを認証できません。"))

        # Add child and tokens to the validated data
        access = AccessToken.for_user(child)
        refresh = RefreshToken.for_user(child)
        attrs['child'] = child
        attrs['access'] = str(access)
        attrs['refresh'] = str(refresh)

        return attrs

    def create_response(self):
        return {
            'message': _('Profile logged in successfully'),
            'role': self.validated_data['child'].role,
            'access': self.validated_data['access'],
            'refresh': self.validated_data['refresh'],
        }
