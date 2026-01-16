from django.utils.translation import gettext_lazy as _
from django.apps import AppConfig

class AdvertisementClassConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'advertisement'
    verbose_name = _("Advertisement")