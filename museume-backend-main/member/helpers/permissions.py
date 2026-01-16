from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

def assign_permissions(user, actions, model):
    """
    Assign specific permissions to a user for a given model.

    :param user: The user to assign permissions to.
    :param actions: List of actions (e.g., 'view', 'add', 'change', 'delete').
    :param model: The model class for which permissions are assigned.
    """
    content_type = ContentType.objects.get_for_model(model)
    for action in actions:
        print(f"{action}_{model._meta.model_name}, {content_type}")
        permission = Permission.objects.get(
            codename=f"{action}_{model._meta.model_name}",
        )
        user.user_permissions.add(permission)
