from django.utils.translation import gettext_lazy as _
from django.apps import AppConfig

class ArtistClassConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'artist_class'
    verbose_name = _("Artist Class")
