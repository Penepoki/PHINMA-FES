from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import Permission
from functools import wraps

def role_required(allowed_roles, required_permission=None):
    """
        Decorator to restrict access based on roles and permissions.

        Args:
            allowed_roles (list): List of user group names allowed to access the resource.
            required_permission (str): Required permission codename (optional).

        Usage:
            @role_required(["Admin", "Manager"], required_permission="can_edit_data")
            def my_view(request):
                    Code goes here...
        """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            #Authentication for user
            user = getattr(request, 'user', None)
            if not request.user.is_authenticated:
                return JsonResponse({'error': 'Unauthorized'}, status=401)

            # User checker if it belongs to the allowed groups/role
            user_groups = request.user.groups.filter(name__in=allowed_roles)
            if not user_groups.exists():
                raise PermissionDenied("Your role does not have access to this resource.")

            # Checker for permissions
            if required_permission:
                has_permission = (Permission.objects.filter(
                    group__in=user_groups,
                    codename=required_permission).exists()
                )
                if not has_permission:
                    raise PermissionDenied("You do not have permission to access this resource.")

            # If all checks pass, execute the view function
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator