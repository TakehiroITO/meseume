from django.utils.translation import gettext_lazy as _
from django.db import models

class Advertisement(models.Model):
    BANNER_FRAME_CHOICES = [
        ('fixed', 'Fixed'),
    ]

    IMAGE_TYPE_CHOICES = [
        ('banner', 'Banner'),
        ('logo', 'Logo'),
    ]

    name = models.CharField(max_length=100, help_text=_("Name of the advertisement plan"), verbose_name=_("name"))
    banner_frame = models.CharField(
        max_length=50, choices=BANNER_FRAME_CHOICES, default='fixed', help_text=_("Banner frame type"), verbose_name=_("banner frame")
    )
    add_type = models.CharField(
        max_length=10, choices=IMAGE_TYPE_CHOICES, default='banner', help_text=_("Type of the image"), verbose_name=_("ad type")
    )
    banner_image = models.ImageField(upload_to='advertisements/', help_text=_("Upload the banner image"), verbose_name=_("banner image"))
    start_date = models.DateTimeField(help_text=_("Start date of the display period"), verbose_name=_("start date"))
    end_date = models.DateTimeField(help_text=_("End date of the display period"), verbose_name=_("end date"))

    class Meta:
        verbose_name = _("Advertisement")
        verbose_name_plural = _("Advertisements")

    def is_active(self):
        from django.utils.timezone import now
        return self.start_date <= now() <= self.end_date

    is_active.boolean = True
    is_active.short_description = _("Currently Active")

    def __str__(self):
        return self.name
