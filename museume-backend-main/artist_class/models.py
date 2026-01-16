from django.utils.translation import gettext_lazy as _
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ArtistClass(models.Model):
    REAL_TIME = 'real_time'
    RECORDED = 'recorded'

    CLASS_TYPE_CHOICES = [
        (REAL_TIME, 'Real Time'),
        (RECORDED, 'Recorded'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'USD'),
        ('JPY', 'JPY'),
    ]

    name = models.CharField(max_length=255, verbose_name=_("name"))
    category = models.CharField(max_length=255, verbose_name=_("category"))
    tags = models.ManyToManyField('work.Tag', related_name='artist_classes', blank=True, verbose_name=_("tags"))  # Reference to 'Tag' in the 'work' app
    is_free = models.BooleanField(default=False, verbose_name=_("is free"))
    class_type = models.CharField(
        max_length=20, choices=CLASS_TYPE_CHOICES, default=RECORDED, verbose_name=_("class type")
    )
    thumbnail = models.ImageField(upload_to='artist_class_thumbnails/', verbose_name=_("thumbnail"))
    url = models.URLField(verbose_name=_("url"))  # For recorded classes
    start_date = models.DateTimeField(null=True, blank=True, verbose_name=_("start date"))
    end_date = models.DateTimeField(null=True, blank=True, verbose_name=_("end date"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_("cost"))  # Added amount field
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    description = models.TextField(verbose_name=_("description"), blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _("Artist Class")
        verbose_name_plural = _("Artist Classes")

    def __str__(self):
        return self.name



class MemberClassSignup(models.Model):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (CONFIRMED, "Confirmed"),
        (COMPLETED, "Completed"),
    ]

    member = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="class_signups"
    )
    artist_class = models.ForeignKey(
        ArtistClass, on_delete=models.CASCADE, related_name="signups"
    )
    signed_up_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=PENDING
    )
    reminder_sent = models.BooleanField(default=False)
    attended = models.BooleanField(default=False)

    class Meta:
        unique_together = ("member", "artist_class")  # Prevent duplicate signups
        indexes = [
            models.Index(fields=["member"]),
            models.Index(fields=["artist_class"]),
        ]

    def __str__(self):
        return f"{self.member.username} signed up for {self.artist_class.name}"


class Payment(models.Model):
    PENDING = 'pending'
    SUCCEEDED = 'succeeded'
    FAILED = 'failed'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SUCCEEDED, 'Succeeded'),
        (FAILED, 'Failed'),
    ]

    member = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="payments"
    )
    artist_class = models.ForeignKey(
        ArtistClass, on_delete=models.CASCADE, related_name="payments"
    )
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_payment_intent_secret = models.TextField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["member"]),
            models.Index(fields=["artist_class"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"Payment for {self.artist_class.name} by {self.member.username} - {self.status}"
    