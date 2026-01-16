from django.utils.translation import gettext_lazy as _
from django.apps import AppConfig


class PublicSiteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'public_site'
    verbose_name = _("Public Site Settings")