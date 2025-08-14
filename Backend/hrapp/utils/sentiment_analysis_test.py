import os
import json
from transformers import pipeline
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

from hrapp.models.evaluation_models import Timestamp, StudentEvaluationResponse, StudentEvaluationQuestion

def is_float_string(s):
    try:
        float(s)
        return True
    except Exception:
        return False

def collect_comments():
    comments = []
    # Existing student/instructor comments
    for ts in Timestamp.objects.all():
        sc = ts.student_comments
        if isinstance(sc, str) and sc.strip():
            comments.append({
                'source': 'student_comment',
                'text': sc.strip(),
                'professor': str(getattr(ts.evaluation, 'instructor', '')),
                'evaluator': str(getattr(ts.evaluation, 'evaluator', '')),
                'evaluator_comment_for': 'student',
                'time_record': str(getattr(ts, 'time_record', ''))
            })
        elif isinstance(sc, dict):
            text = sc.get('text') or sc.get('comment')
            if isinstance(text, str) and text.strip():
                comments.append({
                    'source': 'student_comment',
                    'text': text.strip(),
                    'professor': str(getattr(ts.evaluation, 'instructor', '')),
                    'evaluator': str(getattr(ts.evaluation, 'evaluator', '')),
                    'evaluator_comment_for': 'student',
                    'time_record': str(getattr(ts, 'time_record', ''))
                })
        ic = ts.instructor_comments
        if isinstance(ic, str) and ic.strip():
            comments.append({
                'source': 'instructor_comment',
                'text': ic.strip(),
                'professor': str(getattr(ts.evaluation, 'instructor', '')),
                'evaluator': str(getattr(ts.evaluation, 'evaluator', '')),
                'evaluator_comment_for': 'instructor',
                'time_record': str(getattr(ts, 'time_record', ''))
            })
        elif isinstance(ic, dict):
            text = ic.get('text') or ic.get('comment')
            if isinstance(text, str) and text.strip():
                comments.append({
                    'source': 'instructor_comment',
                    'text': text.strip(),
                    'professor': str(getattr(ts.evaluation, 'instructor', '')),
                    'evaluator': str(getattr(ts.evaluation, 'evaluator', '')),
                    'evaluator_comment_for': 'instructor',
                    'time_record': str(getattr(ts, 'time_record', ''))
                })
    # Exclude ratings: numeric answers and rating/scaled question text/type
    for resp in StudentEvaluationResponse.objects.all():
        q = getattr(resp, 'student_eval_question', None)
        qtype = getattr(q, 'type', None) if q else None
        question_text = getattr(q, 'question', None) if q else ''
        answer = getattr(resp, 'answer', None)
        txt = answer.strip() if type(answer) is str else ''
        rating_keywords = ('rating', 'scale')
        mcq_keywords = ('mcq', 'multiple choice')
        if (
            txt
            and qtype not in ('rating', 'mcq', 'multiple_choice')
            and not txt.isdigit()
            and not is_float_string(txt)
            and not any(kw in question_text.lower() for kw in rating_keywords if question_text)
            and not any(kw in question_text.lower() for kw in mcq_keywords if question_text)
        ):
            comments.append({
                'source': 'student_evaluation_response',
                'user_id': getattr(resp, 'user_id', None),
                'student_evaluation_id': getattr(resp, 'student_evaluation_id', None),
                'student_eval_question_id': getattr(q, 'id', None) if q else None,
                'question_text': question_text,
                'answer_text': txt,
            })
    return comments

# Initialize sentiment analyzer globally
local_model_dir = os.path.abspath(os.path.join(
    os.path.dirname(__file__),
    '..',
    'local_model',
    'distilbert-base-uncased-finetuned-sst-2-english'
))
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model=local_model_dir,
    tokenizer=local_model_dir
)

def analyze_sentiment(comments):
    delimiter = []
    promoter = []
    for comment in comments:
        # extract the appropriate text for sentiment analysis
        if isinstance(comment, dict):
            text = comment.get('text') or comment.get('answer_text')
        else:
            text = comment
        if not text:
            continue
        result = sentiment_analyzer(text)[0]
        if result['label'] == 'NEGATIVE':
            delimiter.append(comment)
        else:
            promoter.append(comment)
    return {"delimiter": delimiter, "promoter": promoter}

if __name__ == "__main__":
    comments = collect_comments()
    result = analyze_sentiment(comments)
    print(json.dumps(result, indent=2, ensure_ascii=False))
