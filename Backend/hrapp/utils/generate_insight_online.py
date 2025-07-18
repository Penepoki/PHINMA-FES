import os
import requests
import yaml
from hrapp.models.evaluation_models import Evaluation, Timestamp
from django.conf import settings

# ---------- LOAD PROMPTS FROM YAML ----------
PROMPT_PATH = os.path.join(os.path.dirname(__file__), '../prompts/ai_prompts.yaml')


def load_prompts():
    if not os.path.exists(PROMPT_PATH):
        raise FileNotFoundError(f"Prompt YAML file not found at {PROMPT_PATH}")
    with open(PROMPT_PATH, 'r', encoding='utf-8') as f:
        prompts_yaml = yaml.safe_load(f)
    if not prompts_yaml or 'prompts' not in prompts_yaml:
        raise KeyError("'prompts' key missing in YAML file.")
    prompts = prompts_yaml['prompts']
    for key in ['copus_code_explanation', 'feedback_instructions']:
        if key not in prompts:
            raise KeyError(f"'{key}' key missing under 'prompts' in YAML file.")
        if 'description' not in prompts[key]:
            raise KeyError(f"'description' key missing under '{key}' in YAML file.")
    return prompts


PROMPTS = load_prompts()
COPUS_CODE_EXPLANATION = PROMPTS['copus_code_explanation']['description']
FEEDBACK_INSTRUCTIONS = PROMPTS['feedback_instructions']['description']


# ---------- API KEY CONFIG ----------
def get_api_key():
    api_key = (
            os.getenv("HUGGINGFACE_API_KEY")
            or os.getenv("HF_API_KEY")
            or getattr(settings, "HF_API_KEY", None)
    )
    if not api_key:
        raise RuntimeError("No HuggingFace API key found in environment variables or Django settings.")
    return api_key


# ---------- AI REQUEST ----------
def generate_ai_feedback(prompt: str, hf_api_key: str, hf_endpoint: str, max_new_tokens: int = 400,
                         temperature: float = 0.7) -> str:
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
    prompt += "\n" + FEEDBACK_INSTRUCTIONS
    if not timestamps:
        prompt += "- No classroom data detected.\n"
    else:
        for i, ts in enumerate(timestamps):
            student_acts = ", ".join([k for k, v in (ts.student_activities or {}).items() if v])
            instructor_acts = ", ".join([k for k, v in (ts.instructor_activities or {}).items() if v])
            prompt += f" Row {i + 1}: Time: {ts.time_record}, Student: [{student_acts}] Instructor: [{instructor_acts}]"
            if ts.student_comments:
                prompt += f", Student Comments: {ts.student_comments}"
            if ts.instructor_comments:
                prompt += f", Instructor Comments: {ts.instructor_comments}"
    prompt += "\n\n[End of data. Copus specialist, please provide your expert feedback for the above classroom data:]\n"
    return prompt


def generate_ai_feedback_for_evaluation(evaluation, hf_endpoint=None, max_new_tokens=400, temperature=0.7):
    """
    Sends a prompt to the HuggingFace inference API and returns the generated feedback.
    Args:
        prompt (str): The prompt to send.
        ...
    Returns:
        str: The generated feedback.
    Raises:
        requests.HTTPError: If the API call fails.
    """
    import re
    timestamp = Timestamp.objects.filter(evaluation=evaluation).order_by('time_record')
    prompt = build_copus_prompt_from_timestamps(evaluation, timestamp)
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("No HuggingFace API key found in environment or settings")
    if not hf_endpoint:
        hf_endpoint = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    feedback = generate_ai_feedback(prompt, api_key, hf_endpoint, max_new_tokens, temperature)
    feedback = feedback.replace(COPUS_CODE_EXPLANATION.strip(), "").replace(FEEDBACK_INSTRUCTIONS.strip(), "").lstrip()
    # Remove any lines that match the data row format: Row N: Time: ...
    feedback = '\n'.join([
        line for line in feedback.splitlines()
        if not re.match(r"^\s*Row \d+: Time: ", line)
    ])
    return {"feedback": feedback}


