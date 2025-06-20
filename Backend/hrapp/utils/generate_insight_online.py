import os
import requests
from hrapp.models.evaluation_models import Evaluation, Timestamp
from django.conf import settings

# ---------- COPUS CODES BRIEF EXPLANATION ----------
COPUS_CODE_EXPLANATION = """
The Classroom Observation Protocol for Undergraduate STEM (COPUS) is a standardized tool to document how STEM instructors and students spend class time. Key codes include:
- Student Codes:
  - L: Listening
  - Ind: Individual Thinking
  - Grp: Group Activity
  - AnQ: Answer Questions
  - AsQ: Ask Questions
  - WC: Whole Class Discussion
  - SP: Student Presentations
  - T/Q: Test/Quiz
  - W: Waiting
  - O: Other

- Instructor Codes:
  - L: Lecture
  - RtW: Realtime Writing
  - M/G: Moving/Guiding
  - AnQ: Answer Question
  - PQ: Pose Question
  - FUp: Follow-up
  - 1o1: 1-on-1 Discussion
  - D/V: Demonstrate/Video
  - Adm: Administrative Tasks
  - W: Waiting
  - O: Other
"""

# ---------- API KEY CONFIG ----------
def get_api_key():
    return (
        os.getenv("HUGGINGFACE_API_KEY")
        or os.getenv("HF_API_KEY")
        or getattr(settings, "HF_API_KEY", None)
    )
    #raise RuntimeError("No HuggingFace API key found in 'HUGGINGFACE_API_KEY' or 'HF_API_KEY' environment variable.")

# ---------- AI REQUEST ----------
def generate_ai_feedback(prompt: str, hf_api_key: str, hf_endpoint: str, max_new_tokens: int = 400, temperature: float = 0.7) -> str:
    headers = {
        "Authorization": f"Bearer {hf_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "do_sample": True,
            "max_new_tokens": max_new_tokens,
            "temperature": temperature
        }
    }
    resp = requests.post(hf_endpoint, headers=headers, json=payload)
    resp.raise_for_status()
    result = resp.json()
    if isinstance(result, list):
        return result[0].get("generated_text", "").strip()

    elif isinstance(result, dict) and "generated_text" in result:
        return result["generated_text"].strip()

    elif isinstance(result, dict) and "choices" in result:
        return result["choices"][0]["text"].strip()
    else:
        return str(result)

# ---------- PROMPT FORMULATION (UPDATED) ----------
def build_copus_prompt_from_timestamps(evaluation, timestamps):
    prompt = COPUS_CODE_EXPLANATION
    prompt += "\n\nBelow is all data from a COPUS class session. Each row is a timestamped observation from the class session."
    prompt += "\nProvide a concise but actionable classroom-level feedback, highlighting strength and meaningful areas for instructor/professor improvement using evidence from the data"
    prompt += "\n\nData:\n"
    if not timestamps:
        prompt += "- No classroom data detected.\n"
    else:
        for i, ts in enumerate(timestamps):
            student_acts = ", ".join([k for k, v in (ts.student_activities or {}).items() if v])
            instructor_acts = ", ".join([k for k, v in (ts.instructor_activities or {}).items() if v])
            prompt += f" Row {i+1}: Time: {ts.time_record}, Student: [{student_acts}] Instructor: [{instructor_acts}]"
            if ts.student_comments:
                prompt += f", Student Comments: {ts.student_comments}"
            if ts.instructor_comments:
                prompt += f", Instructor Comments: {ts.instructor_comments}"

    prompt += "\n\n[End of data. Copus specialist, please provide your expert feedback for the above classroom data:]\n"
    return prompt

def generate_ai_feedback_for_evaluation(evaluation, hf_endpoint=None, max_new_tokens=400, temperature=0.7):
    timestamp = Timestamp.objects.filter(evaluation=evaluation).order_by('time_record')
    prompt = build_copus_prompt_from_timestamps(evaluation, timestamp)
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("No HuggingFace API key found in environment or settings")
    if not hf_endpoint:
        hf_endpoint = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
    feedback = generate_ai_feedback(prompt, api_key, hf_endpoint, max_new_tokens, temperature)
    feedback = feedback.replace(COPUS_CODE_EXPLANATION.strip(), "").lstrip()
    return {"feedback": feedback}


