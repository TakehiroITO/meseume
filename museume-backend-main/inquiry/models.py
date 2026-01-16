from django.utils.translation import gettext_lazy as _
from django.db import models

class Inquiry(models.Model):
    user_email = models.EmailField(verbose_name=_("email"))
    user_name = models.CharField(max_length=255, verbose_name=_("user name"))
    subject = models.CharField(max_length=255, verbose_name=_("subject"))
    inquiry_message = models.TextField(verbose_name=_("message"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("created at"))

    class Meta:
        verbose_name = _("Inquiry")
        verbose_name_plural = _("Inquiries")

    def __str__(self):
        return f"{self.id} - {self.user_name} - {self.subject}"
