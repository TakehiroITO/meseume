from django.contrib import admin
from .models import PublicNavBar

@admin.register(PublicNavBar)
class PublicNavBarAdmin(admin.ModelAdmin):
    list_display = ('url', 'navbar_type', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

    def has_view_permission(self, request, obj=None):
        """Only superusers can view PublicNavBar entries."""
        return request.user.is_superuser

    def has_add_permission(self, request):
        """Only superusers can add PublicNavBar entries."""
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        """Only superusers can edit PublicNavBar entries."""
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete PublicNavBar entries."""
        return request.user.is_superuser
