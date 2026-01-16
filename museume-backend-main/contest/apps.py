from django.utils.translation import gettext_lazy as _
from django.apps import AppConfig


class ContestConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'contest'
    verbose_name = _("contest")