import os
import json
import re
from transformers import pipeline
import django
import sys
from typing import Any, Dict, List, Optional, Tuple

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

from hrapp.models.evaluation_models import Timestamp, StudentEvaluationResponse, StudentEvaluationQuestion

############################################################
# Utilities
############################################################

def _safe_lower(s: Optional[str]) -> str:
    return s.lower().strip() if isinstance(s, str) else ""


def _normalize_text(s: Optional[str]) -> str:
    if not isinstance(s, str):
        return ""
    s2 = s.strip().lower()
    s2 = re.sub(r"\s+", " ", s2)
    return s2


############################################################
# Sentiment Analyzer (local DistilBERT or HuggingFace Hub)
############################################################
local_model_dir = os.path.abspath(os.path.join(
    os.path.dirname(__file__),
    '..',
    'local_model',
    'distilbert-base-uncased-finetuned-sst-2-english'
))

# Try to use local model first, fall back to HuggingFace Hub if not available
try:
    if os.path.exists(local_model_dir) and os.path.isdir(local_model_dir):
        print(f"[INFO] Using local DistilBERT model from: {local_model_dir}")
        sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model=local_model_dir,
            tokenizer=local_model_dir
        )
    else:
        print(f"[INFO] Local model not found at {local_model_dir}")
        print("[INFO] Using DistilBERT model from HuggingFace Hub")
        sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
except Exception as e:
    print(f"[WARNING] Failed to load local model: {e}")
    print("[INFO] Falling back to HuggingFace Hub model")
    sentiment_analyzer = pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english"
    )


def analyze_text_sentiment(text: str) -> Dict[str, Any]:
    """Use DistilBERT to classify text and return +1 for positive, -1 for negative."""
    if not text or not isinstance(text, str):
        return {"label": "NEUTRAL", "score": 0.0, "points": 0}
    res = sentiment_analyzer(text)[0]
    label = res.get("label", "NEUTRAL")
    score = float(res.get("score", 0.0))
    points = 1 if label == "POSITIVE" else -1
    return {"label": label, "score": score, "points": points}


############################################################
# MCQ Scoring
############################################################
# Default mapping for letter choices a-e → requested scores.
LETTER_TO_POINTS = {
    'a': 1.0,
    'b': 0.5,
    'c': 0.0,
    'd': -0.5,
    'e': -1.0,
}

# Keyword buckets to detect semantic value of option text
MCQ_BUCKETS = [
    (1.0, [
        "very likely", "strongly agree", "excellent", "very satisfied",
        "always", "outstanding", "very good"
    ]),
    (0.5, [
        "likely", "agree", "good", "satisfied", "often"
    ]),
    (0.0, [
        "neutral", "neither agree nor disagree", "fair", "sometimes"
    ]),
    (-0.5, [
        "unlikely", "disagree", "poor", "unsatisfied", "rarely"
    ]),
    (-1.0, [
        "very unlikely", "strongly disagree", "very poor", "very unsatisfied",
        "never", "bad"
    ]),
]


def _match_bucket(option_text: str) -> Optional[float]:
    t = _normalize_text(option_text)
    for points, keywords in MCQ_BUCKETS:
        for kw in keywords:
            if kw in t:
                return points
    return None


def score_mcq_answer(question: Optional[StudentEvaluationQuestion], raw_answer: Any) -> Tuple[float, Dict[str, Any]]:
    """
    Score an MCQ answer.
    Supports:
    - Letter responses (a/b/c/d/e)
    - Index responses (0/1/2/3/4 or 1/2/3/4/5) mapped to options
    - Direct option text matching to buckets
    Returns (points, meta)
    """
    meta: Dict[str, Any] = {"mode": None, "matched_option": None, "reason": None}

    ans = str(raw_answer).strip() if raw_answer is not None else ""
    if not ans:
        meta["reason"] = "empty_answer"
        return 0.0, meta

    ans_l = _normalize_text(ans)

    # 1) Letter choices a-e
    if ans_l in LETTER_TO_POINTS:
        meta["mode"] = "letter"
        meta["matched_option"] = ans_l
        return LETTER_TO_POINTS[ans_l], meta

    # Prepare options list from question (if available)
    options = []
    if question and isinstance(question.options, (list, tuple)):
        options = list(question.options)
    elif question and isinstance(question.options, dict):
        # Some schemas store options like {"a": "Very Likely", ...}
        # Keep in alphabetical order of keys to align a-e if possible
        for key in sorted(question.options.keys()):
            options.append(question.options[key])

    # 2) Numeric index mapping
    # Try to map integer index to options (supports 0-based and 1-based)
    if ans_l.isdigit():
        idx = int(ans_l)
        candidates = []
        if options:
            if 0 <= idx < len(options):
                candidates.append(options[idx])
            if 1 <= idx <= len(options):
                candidates.append(options[idx - 1])
        # If we got a candidate option, apply bucket mapping
        for cand in candidates:
            pts = _match_bucket(str(cand))
            if pts is not None:
                meta["mode"] = "index"
                meta["matched_option"] = cand
                return pts, meta

    # 3) Direct text match to one of the options if present
    if options:
        for opt in options:
            if _normalize_text(str(opt)) == ans_l:
                pts = _match_bucket(str(opt))
                if pts is not None:
                    meta["mode"] = "option_text"
                    meta["matched_option"] = opt
                    return pts, meta
                # If not matched by bucket, try to infer via position a-e
                # a-e positional fallback
                idx = options.index(opt)
                if idx == 0: return 1.0, {"mode": "position_fallback", "matched_option": opt}
                if idx == 1: return 0.5, {"mode": "position_fallback", "matched_option": opt}
                if idx == 2: return 0.0, {"mode": "position_fallback", "matched_option": opt}
                if idx == 3: return -0.5, {"mode": "position_fallback", "matched_option": opt}
                if idx == 4: return -1.0, {"mode": "position_fallback", "matched_option": opt}

    # 4) If answer is text that itself includes keyword semantics, score via bucket
    pts = _match_bucket(ans)
    if pts is not None:
        meta["mode"] = "free_text_bucket"
        meta["matched_option"] = ans
        return pts, meta

    # 5) Could not determine, neutral default 0
    meta["reason"] = "no_match"
    return 0.0, meta


############################################################
# Data collection from DB
############################################################

def collect_timestamp_comments() -> List[Dict[str, Any]]:
    comments: List[Dict[str, Any]] = []
    for ts in Timestamp.objects.all():
        sc = ts.student_comments
        if isinstance(sc, str) and sc.strip():
            comments.append({"source": "student_comment", "text": sc.strip()})
        elif isinstance(sc, dict):
            text = sc.get("text") or sc.get("comment")
            if isinstance(text, str) and text.strip():
                comments.append({"source": "student_comment", "text": text.strip()})
        ic = ts.instructor_comments
        if isinstance(ic, str) and ic.strip():
            comments.append({"source": "instructor_comment", "text": ic.strip()})
        elif isinstance(ic, dict):
            text = ic.get("text") or ic.get("comment")
            if isinstance(text, str) and text.strip():
                comments.append({"source": "instructor_comment", "text": text.strip()})
    return comments


def process_student_evaluations() -> Dict[str, Any]:
    """
    Iterate over StudentEvaluationResponse and score according to question type.
    - MCQ: map to numeric scale (1, 0.5, 0, -0.5, -1)
    - TEXT: DistilBERT POSITIVE→+1, NEGATIVE→-1
    - RATING: ignored in scoring (could be added in future)
    Returns structured results and totals.
    """
    mcq_scores: List[Dict[str, Any]] = []
    text_sentiments: List[Dict[str, Any]] = []

    for resp in StudentEvaluationResponse.objects.all():
        q: Optional[StudentEvaluationQuestion] = getattr(resp, 'student_eval_question', None)
        qtype = _safe_lower(getattr(q, 'type', None)) if q else ""
        question_text = getattr(q, 'question', None) if q else ""
        answer = getattr(resp, 'answer', None)
        evaluation_id = getattr(resp, 'student_evaluation_id', None)
        question_id = getattr(q, 'id', None) if q else None

        if qtype == "mcq":
            points, meta = score_mcq_answer(q, answer)
            mcq_scores.append({
                "student_evaluation_id": evaluation_id,
                "student_eval_question_id": question_id,
                "question": question_text,
                "answer": answer,
                "points": points,
                "meta": meta,
            })
        elif qtype == "text":
            # Include some context: "Q: ... A: ..." to help model
            text_input = f"Question: {question_text}\nAnswer: {answer}" if question_text else str(answer)
            sres = analyze_text_sentiment(text_input)
            text_sentiments.append({
                "student_evaluation_id": evaluation_id,
                "student_eval_question_id": question_id,
                "question": question_text,
                "answer": answer,
                "sentiment": sres.get("label"),
                "confidence": sres.get("score"),
                "points": sres.get("points"),
            })
        else:
            # Skip RATING or unknown types for now
            continue

    total_mcq = float(sum(item.get("points", 0.0) for item in mcq_scores))
    total_text = float(sum(item.get("points", 0.0) for item in text_sentiments))

    return {
        "mcq_scores": mcq_scores,
        "text_sentiments": text_sentiments,
        "totals": {
            "sum_mcq": total_mcq,
            "sum_text": total_text,
            "overall": total_mcq + total_text,
        }
    }


def analyze_timestamp_comments(comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    promoter: List[Dict[str, Any]] = []
    delimiter: List[Dict[str, Any]] = []
    detailed: List[Dict[str, Any]] = []

    for comment in comments:
        text = comment.get('text')
        if not text:
            continue
        res = analyze_text_sentiment(text)
        item = {**comment, "sentiment": res["label"], "confidence": res["score"], "points": res["points"]}
        detailed.append(item)
        if res["label"] == "NEGATIVE":
            delimiter.append(item)
        else:
            promoter.append(item)

    return {
        "promoter": promoter,
        "delimiter": delimiter,
        "detailed": detailed,
        "totals": {
            "sum_points": float(sum(x.get("points", 0.0) for x in detailed))
        }
    }


if __name__ == "__main__":
    # 1) Process Student Evaluation responses (MCQ + TEXT)
    sff_summary = process_student_evaluations()

    # 2) Optionally analyze timestamp comments (student/instructor)
    ts_comments = collect_timestamp_comments()
    ts_summary = analyze_timestamp_comments(ts_comments) if ts_comments else {"promoter": [], "delimiter": [], "detailed": [], "totals": {"sum_points": 0.0}}

    # 3) Print combined result as JSON
    output = {
        "student_evaluations": sff_summary,
        "timestamp_comments": ts_summary,
    }
    print(json.dumps(output, indent=2, ensure_ascii=False))
