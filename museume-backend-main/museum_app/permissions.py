from rest_framework import permissions
from django.utils.translation import gettext as _

class IsChild(permissions.BasePermission):
    """
    Custom permission to allow access only to users with the 'child' role.
    """
    message = _('Access restricted to profile users only.')

    def has_permission(self, request, view):
        # Check if the user is authenticated and their role is 'child'
        return bool(request.user and request.user.is_authenticated and request.user.role == 'child')
