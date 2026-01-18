from django.db import models
from member.models import Member  # Assuming the user model is in the member app
import hashlib
from django.db import models
from rest_framework.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db.utils import IntegrityError
class Image(models.Model):
    image = models.ImageField(upload_to='works/', verbose_name=_("image"))
    hash = models.CharField(max_length=64, unique=True, editable=False, verbose_name=_("hash"))  # SHA-256 hash for uniqueness
    work = models.ForeignKey('Work', on_delete=models.CASCADE, related_name='images', verbose_name=_("work"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))

    class Meta:
        verbose_name = _("Image")
        verbose_name_plural = _("Images")

    def save(self, *args, **kwargs):
        if not self.hash:
            # Generate the hash for the image content
            self.hash = self.generate_image_hash()

        try:
            super().save(*args, **kwargs)
        except IntegrityError:
            raise ValidationError(_("Image already exists in the system."))


    def generate_image_hash(self):
        """Generate a unique hash based on the image file content."""
        image_content = self.image.read()
        return hashlib.sha256(image_content).hexdigest()

    def __str__(self):
        return f"Image {self.id} - Hash: {self.hash}"


# Work limits per member type (RFP requirements)
WORK_LIMIT_FREE = 20
WORK_LIMIT_PAID = 100


class Work(models.Model):
    title = models.CharField(max_length=255, verbose_name=_("title"), null=True, blank=True)
    description = models.TextField(null=True, blank=True, verbose_name=_("description"))
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='works', verbose_name=_("member"))
    # RFP: Default to private (non-public) - changed from True to False
    is_public = models.BooleanField(default=False, verbose_name=_("is public"))
    # RFP: Works require admin approval before being public
    is_approved = models.BooleanField(default=False, verbose_name=_("is approved"))
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_("price"))
    tags = models.ManyToManyField('Tag', related_name='works', blank=True, verbose_name=_("tags"))
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, related_name='works', null=True, blank=True, verbose_name=_("category"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))
    # RFP: Default visibility should be private - changed from 'public' to 'private'
    public_visibility = models.CharField(
        max_length=50,
        choices=[('private', 'Private'), ('public', 'Public')],
        default='private',
        verbose_name=_("public visibility")
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Work")
        verbose_name_plural = _("Works")

    def __str__(self):
        return self.title or f"Work {self.id}"

    @classmethod
    def get_work_limit(cls, member):
        """
        Get the work limit for a member based on their subscription status.

        RFP Requirements:
        - Free members: 20 works
        - Paid members: 100 works

        Args:
            member: Member instance

        Returns:
            int: Maximum number of works allowed
        """
        # TODO: Check actual subscription/billing status
        # For now, check if member has any active subscription
        # This should be integrated with the billing app
        if hasattr(member, 'subscriptions') and member.subscriptions.filter(is_active=True).exists():
            return WORK_LIMIT_PAID
        return WORK_LIMIT_FREE

    @classmethod
    def can_create_work(cls, member):
        """
        Check if a member can create a new work based on their limit.

        Args:
            member: Member instance

        Returns:
            tuple: (can_create: bool, message: str)
        """
        current_count = cls.objects.filter(member=member).count()
        limit = cls.get_work_limit(member)

        if current_count >= limit:
            return False, _("作品の上限（%(limit)s点）に達しました。") % {'limit': limit}
        return True, ""

    @classmethod
    def get_remaining_slots(cls, member):
        """
        Get the number of remaining work slots for a member.

        Args:
            member: Member instance

        Returns:
            int: Number of works the member can still create
        """
        current_count = cls.objects.filter(member=member).count()
        limit = cls.get_work_limit(member)
        return max(0, limit - current_count)
    

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name=_("name"))

    class Meta:
        verbose_name = _("Tag")
        verbose_name_plural = _("Tags")

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name=_("name"))

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")

    def __str__(self):
        return self.name

class Like(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)  # The user who liked the work
    work = models.ForeignKey('Work', on_delete=models.CASCADE, related_name='likes')  # The liked artwork
    liked_at = models.DateTimeField(auto_now_add=True)  # Timestamp of the like

    class Meta:
        unique_together = ('member', 'work')
