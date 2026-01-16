from django.utils.translation import gettext_lazy as _
from django.apps import AppConfig


class WorkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'work'
    verbose_name = _("work")