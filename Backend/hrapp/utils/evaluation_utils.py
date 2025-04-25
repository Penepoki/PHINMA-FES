from hrapp.models import Evaluation
from django.db.models import Prefetch


def format_evaluation(evaluation):
    return {
        'id': evaluation.id,
        'evaluators': [f"{e.first_name} {e.last_name}" for e in evaluation.evaluators.all()],
        'instructors': [f"{i.first_name} {i.last_name}" for i in evaluation.instructors.all()],
        'comments': [
                        f"{comment}" for comment in evaluation.student_comments or []
                    ]
                        +
                    [
                        f"{comment}" for comment in evaluation.instructor_comments or []
                    ],

        'date': evaluation.observation_date
    }


def get_latest_evaluation():
    try:
        evaluation = Evaluation.objects.prefetch_related('evaluators', 'instructors').latest('id')
        return {'data': format_evaluation(evaluation)}

    except Evaluation.DoesNotExist:
        return {'error': 'No evaluations found'}


def get_all_evaluations(request=None):  # Add `request` param even if unused
    # your code...
    return {"message": "All evaluations"}  # dummy example