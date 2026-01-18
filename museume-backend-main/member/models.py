import secrets
import string
from django.db import models
from django.db.models import Q
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from .helpers import generate_ulid, generate_child_email, extract_parent_email, is_child_email

class Organization(models.Model):
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="branches", verbose_name=_("Parent Organization"))

    name = models.CharField(max_length=255, unique=True, verbose_name=_("name"))
    email = models.EmailField(help_text=_("Organization admin email"), verbose_name=_("email address"))
    username = models.CharField(max_length=255, unique=True, help_text=_("Organization username will be used for museume email address"), verbose_name=_("username"))
    staff_name = models.CharField(max_length=255, help_text=_("Organization admin staff name"), verbose_name=_("staff name"))
    address = models.TextField(verbose_name=_("address"))
    organization_code = models.CharField(max_length=6, blank=True, verbose_name=_("Organization Code"))
    organization_icon = models.ImageField(
        upload_to='profile_pictures/', 
        blank=True, 
        null=True,
        help_text=_("Profile picture of the organization"),
        verbose_name=_("icon")
    )
    custom_email_address = models.EmailField(null=True, blank=True, verbose_name=_("custom email address"))
    city = models.CharField(max_length=255, verbose_name=_("city"))
    country = models.CharField(max_length=255, verbose_name=_("country"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))

    class Meta:
        verbose_name = _("Organization")
        verbose_name_plural = _("Organizations")

    def save(self, *args, **kwargs):
        if not self.organization_code:
            # Generate a unique 6-character alphanumeric code
            characters = string.ascii_uppercase + string.digits
            while True:
                random_code = ''.join(secrets.choice(characters) for _ in range(6))
                if not Organization.objects.filter(organization_code=random_code).exists():
                    self.organization_code = random_code
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.organization_code}"
    
    def get_branches(self):
        return self.branches.all()
    
    def get_nested_branches(self):
        all_branch_ids = Organization.get_all_branch_ids(self)
        return Organization.objects.filter(id__in=all_branch_ids).all()

    # Recursive function to collect all branch IDs
    @classmethod
    def get_all_branch_ids(cls, org):
        branch_ids = [org.id]
        for branch in org.branches.all():
            branch_ids.extend(Organization.get_all_branch_ids(branch))
        return branch_ids

    def get_children(self):
        """
        Retrieve all Members with the role 'child' who are part of this Organization
        or any of its branches (recursively).
        """
        # 1. Collect all branch IDs (including self) via a helper method
        all_branch_ids = Organization.get_all_branch_ids(self)
        
        # 2. Return all 'child' Members whose organization FK or
        #    organizations M2M field links to one of those branch IDs.
        return Member.objects.filter(
            role='child'
        ).filter(
            Q(organizations__id__in=all_branch_ids)
        ).distinct()


class Member(AbstractUser):
    ROLE_CHOICES = [
        ('company_admin', 'Company Administrator'),
        ('branch_admin', 'Branch Administrator'),
        ('system_admin', 'System Administrator'),
        ('group_member', 'Group Member'),
        ('protector', 'Protector'),
        ('child', 'Child'),
    ]

    # ULID: Immutable internal identifier (public ID for external reference)
    # This is separate from Django's auto-generated 'id' for compatibility
    ulid = models.CharField(
        max_length=26,
        unique=True,
        editable=False,
        verbose_name=_('ULID'),
        help_text=_('Immutable unique identifier for external reference')
    )

    # Username: Used for login authentication (immutable after creation)
    # Note: username field is inherited from AbstractUser, we override to emphasize immutability

    # Email: Used for communication (mutable)
    # For children: initially set to parent_email#child_ULID format
    email = models.EmailField(unique=True, null=False, blank=False, verbose_name=_('Email'),)
    organizations = models.ManyToManyField(
        Organization, blank=True, related_name="members", verbose_name=_('Organization'),
    )
    organization = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.SET_NULL, verbose_name=_('Organization'))
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name="children", verbose_name=_('Parent Account')
    )
    is_approved = models.BooleanField(default=False, verbose_name=_("is approved"))
    address = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("address"))
    date_of_birth = models.DateField(null=True, blank=True, verbose_name=_("data of birth"))
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='protector',
        help_text=_("Role of the member in the organization"),
        verbose_name=_("role")
    )
    shared_users = models.ManyToManyField(
        'self', blank=True, related_name="shared_members", verbose_name=_("shared users")
    )
    is_published = models.BooleanField(default=False, help_text=_("Is the member published?"), verbose_name=_("is published"))

    def save(self, *args, **kwargs):
        # Auto-generate ULID if not set
        if not self.ulid:
            self.ulid = generate_ulid()

        # For child accounts without email, generate from parent's email
        if self.role == 'child' and self.parent and not self.email:
            self.email = generate_child_email(self.parent.email, self.ulid)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.username if self.role == "child" else self.email

    def get_notification_email(self):
        """
        Get the email address to use for sending notifications.

        For child accounts with generated emails, returns the parent's email.
        Otherwise returns the member's own email.
        """
        if is_child_email(self.email):
            return extract_parent_email(self.email)
        return self.email

    def is_child_account(self):
        """Check if this is a child account with a generated email."""
        return self.role == 'child' and is_child_email(self.email)

    def can_update_email(self):
        """
        Check if this member can update their email address.

        Children with generated emails can update to become independent.
        All other members can always update their email.
        """
        return True  # All members can update email (children can become independent)

    def get_sibilings(self):
        return self.parent.children.all() if self.parent else []

    def get_shared_siblings(self):
        """Get siblings that are shared with this member."""
        if not self.parent:
            return Member.objects.none()

        # Get all siblings (excluding self)
        siblings = self.parent.children.exclude(id=self.id)

        # Filter siblings that have shared this user
        shared_siblings = siblings.filter(shared_users=self)

        return shared_siblings

class StaffMember(Member):
    class Meta:
        proxy = True
        verbose_name = _("Staff")
        verbose_name_plural = _("Staff")


class RegularMember(Member):
    class Meta:
        proxy = True
        verbose_name = _("Member")
        verbose_name_plural = _("Members")

class ProfileMember(Member):
    class Meta:
        proxy = True
        verbose_name = _("ProfileMember")
        verbose_name_plural = _("ProfileMembers")
