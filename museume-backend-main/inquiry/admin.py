from django.contrib import admin
from .models import Inquiry

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'user_name', 'subject', 'created_at')
    readonly_fields = ('user_name', 'user_email', 'subject', 'created_at')

    def has_view_permission(self, request, obj=None):
        """Only superusers can view PublicNavBar entries."""
        return request.user.is_superuser

    def has_add_permission(self, request):
        """Only superusers can add PublicNavBar entries."""
        return False

    def has_change_permission(self, request, obj=None):
        """Only superusers can edit PublicNavBar entries."""
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete PublicNavBar entries."""
        return False
