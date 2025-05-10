from hrapp.models import Evaluation, User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import Permission
from django.db.models import Prefetch


def format_evaluation(evaluation):
    return {
        'id': evaluation.id,
        'evaluators': [
            f"{e.first_name} {e.last_name}" for e in evaluation.evaluators.all()
        ],
        'instructors': [
            f"{i.first_name} {i.last_name}" for i in evaluation.instructors.all()
        ],
        'student_comments': evaluation.student_comments or [],
        'instructor_comments': evaluation.instructor_comments or [],
        'date': evaluation.observation_date,
    }



def get_latest_evaluation():
    try:
        evaluation = Evaluation.objects.prefetch_related('evaluators', 'instructors').latest('id')
        return {'data': format_evaluation(evaluation)}

    except Evaluation.DoesNotExist:
        return {'error': 'No evaluations found'}

def create_evaluation(data):
    evaluators = data.pop('evaluators', [])
    instructors = data.pop('instructors', [])

    with transaction.atomic():
        # In case of failure, the database remains unchanged
        evaluation = Evaluation.objects.create(**data)

        # Safely link related objects
        evaluation.evaluators.set(evaluators)
        evaluation.instructors.set(instructors)

    return evaluation


def update_evaluation(evaluation_id, data):
    evaluation = get_object_or_404(Evaluation, pk=evaluation_id, is_deleted=False)

    evaluators = data.pop("evaluators", None)
    instructors = data.pop("instructors", None)

    with transaction.atomic():
        # Ensure atomic update
        for field, value in data.items():
            if hasattr(evaluation, field):
                setattr(evaluation, field, value)

        if evaluators is not None:
            evaluation.evaluators.set(evaluators)
        if instructors is not None:
            evaluation.instructors.set(instructors)

        evaluation.save()

    return evaluation


def delete_evaluation(evaluation_id, soft_delete=True):
    evaluation = get_object_or_404(Evaluation, pk=evaluation_id)

    if soft_delete:
        if evaluation.is_deleted:
            return {'error': 'Evaluation is already soft-deleted'}

        evaluation.deleted_at = timezone.now()
        evaluation.is_deleted = True
        evaluation.save()
    else:
        evaluation.delete()  # Hard delete
    return evaluation


def restore_evaluation(evaluation_id):
    evaluation = get_object_or_404(Evaluation, pk=evaluation_id, is_deleted=True)

    if evaluation.deleted_at is None:
        return {'error': 'Evaluation is already active and not deleted'}

    evaluation.deleted_at = None
    evaluation.is_deleted = False
    evaluation.save()
    return evaluation


def get_evaluations(active_only=True):

    if active_only:
        return Evaluation.objects.filter(is_deleted=False)
    return Evaluation.objects.all()


def get_all_evaluations(request=None):  # Add `request` param even if unused
    # your code...
    return {"message": "All evaluations"}  # dummy example

#Custom Decorators related to Evaluation and User. For permissions of CRUD and other restricted Functions Look Here!
def role_required(allowed_roles, required_permission=None):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({"Unauthorized"}, status=401)

            user_groups = request.user.groups.filter(
                name__in=allowed_roles)
            if not user_groups.exists():
                raise PermissionDenied("You don't have permission to access this resource.")

            # Dynamically check if any of the user's groups has the required permission
            if required_permission:
                has_permission = (
                    Permission.objects.filter(
                        group__in=user_groups,
                        codename=required_permission
                    ).exists()
                )
                if not has_permission:
                    raise PermissionDenied("You don't have permission to access this resource.")



            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator