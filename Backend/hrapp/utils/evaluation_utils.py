from hrapp.models import *
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction




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

def format_multiple_evaluations(evaluations):
    return [format_evaluation(evaluation) for evaluation in evaluations]



#CRUD BELOW
#CREATE
#-------------------------------------------------------------
def create_evaluation(data):
    evaluators = data.pop('evaluators', [])
    instructors = data.pop('instructors', [])

    # In case of failure, the database remains unchanged
    with transaction.atomic():

        # Create the evaluation
        evaluation = Evaluation.objects.create(**data)

        # Manually link evaluators through the EvaluationEvaluator model
        for evaluator in evaluators:
            EvaluationEvaluator.objects.create(evaluation=evaluation,
                evaluator=evaluator)

       # Manually link instructors through the EvaluationInstructor model
        for instructor in instructors:
            EvaluationInstructor.objects.create(evaluation=evaluation,
                instructor=instructor)

    return evaluation
#----------------------------------------------------------------

#UPDATE
#-------------------------------------------------------
def update_evaluation(evaluation_id, data):
    evaluation = get_object_or_404(Evaluation, pk=evaluation_id,
            is_deleted=False)

    evaluators = data.pop("evaluators", None)
    instructors = data.pop("instructors", None)

    with transaction.atomic():
        # Ensure atomic update
        for field, value in data.items():
            if hasattr(evaluation, field):
                setattr(evaluation, field, value)

        # Update evaluators
        if evaluators is not None:
            # Clear old Relationships evaluator
            EvaluationEvaluator.objects.filter(evaluation=evaluation).delete()
            # Add new Relationship
            for evaluator in evaluators:
                EvaluationEvaluator.objects.create(evaluation=evaluation,
                    evaluator=evaluator)
        #Update instructors
        if instructors is not None:
            # Clear old Relationship for instructor
            EvaluationInstructor.objects.filter(
                evaluation=evaluation
            ).delete()
            # Add new Relationship
            for instructor in instructors:
                EvaluationInstructor.objects.create(evaluation=evaluation,
                    instructor=instructor)

        evaluation.save()

    return evaluation
#--------------------------------------------------------

#DELETE (The app does SOFT DELETE
#--------------------------------------------------------
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

#RESTORE (FOR DELETED DATAS
#----------------------------------------------------------
def restore_evaluation(evaluation_id):
    evaluation = get_object_or_404(Evaluation, pk=evaluation_id, is_deleted=True)

    if evaluation.deleted_at is None:
        return {'error': 'Evaluation is already active and not deleted'}

    evaluation.deleted_at = None
    evaluation.is_deleted = False
    evaluation.save()
    return evaluation
#-----------------------------------------------------------

#READ or RETRIEVE
#-----------------------------------------------------------
def get_evaluations(active_only=True):

    if active_only:
        return Evaluation.objects.filter(is_deleted=False)
    return Evaluation.objects.all()

def get_evaluations_deleted_included():
    evaluations = Evaluation.objects.prefetch_related('evaluators', 'instructors').all()
    if evaluations.exists():
        return {'data': format_multiple_evaluations(evaluations)}
    return {'error': 'No evaluations found'}


#READ or RETRIEVE for latest, single data and the max ID
def get_latest_evaluation():
    try:
        evaluation = Evaluation.objects.prefetch_related('evaluators', 'instructors').latest('id')
        return {'data': format_evaluation(evaluation)}

    except Evaluation.DoesNotExist:
        return {'error': 'No evaluations found'}
#----------------------------------------------------------

#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#END OF CRUD CODE

