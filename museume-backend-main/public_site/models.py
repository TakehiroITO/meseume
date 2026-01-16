from django.utils.translation import gettext_lazy as _
from django.db import models
# Create your models here.

class PublicNavBar(models.Model):
    NAV_CHOICES = [
        ('blog', 'Blog'),
        ('about', 'About Us'),
    ]
    url = models.CharField(max_length=100, verbose_name=_("url"))
    navbar_type = models.CharField(
        max_length=10,
        choices=NAV_CHOICES,
        default='blog',
        help_text=_("Type of navbar"),
        verbose_name=_("type"),
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("updated at"))

    class Meta:
        verbose_name = _("Public NavBar")
        verbose_name_plural = _("Public NavBar")

    def __str__(self):
        return self.navbar_type
