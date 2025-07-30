import os
import yaml
from hrapp.models.evaluation_models import Evaluation, Timestamp
from django.conf import settings
from huggingface_hub import InferenceClient

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
            
    )
    if not api_key:
        raise RuntimeError("No HuggingFace API key found in environment variables or Django settings.")
    return api_key

# ---------- AI REQUEST (HuggingFace Hub InferenceClient) ----------
def generate_ai_feedback(prompt: str, hf_api_key: str, model: str = "mistralai/Mixtral-8x7B-Instruct-v0.1", max_new_tokens: int = 1024, temperature: float = 0.7) -> str:
    client = InferenceClient(provider="together", api_key=hf_api_key)
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_new_tokens,
        temperature=temperature
    )
    return completion.choices[0].message['content'] if hasattr(completion.choices[0], 'message') else str(completion)

# ---------- ENHANCED DATA ANALYSIS FUNCTIONS ----------
def analyze_copus_patterns(timestamps):
    """Analyze specific patterns in the COPUS data for tailored feedback"""
    if not timestamps:
        return {
            'total_duration': 0,
            'dominant_student_activity': None,
            'dominant_instructor_activity': None,
            'activity_transitions': 0,
            'engagement_level': 'No data',
            'specific_observations': []
        }
    
    # Calculate session metrics
    total_entries = len(timestamps)
    student_activity_counts = {}
    instructor_activity_counts = {}
    transitions = 0
    prev_student_acts = None
    prev_instructor_acts = None
    
    specific_observations = []
    
    for i, ts in enumerate(timestamps):
        # Count activities
        student_acts = [k for k, v in (ts.student_activities or {}).items() if v]
        instructor_acts = [k for k, v in (ts.instructor_activities or {}).items() if v]
        
        for act in student_acts:
            student_activity_counts[act] = student_activity_counts.get(act, 0) + 1
        for act in instructor_acts:
            instructor_activity_counts[act] = instructor_activity_counts.get(act, 0) + 1
        
        # Track transitions
        if prev_student_acts != student_acts or prev_instructor_acts != instructor_acts:
            transitions += 1
        
        # Collect specific observations
        if ts.student_comments or ts.instructor_comments:
            specific_observations.append({
                'time': str(ts.time_record),
                'student_comment': ts.student_comments,
                'instructor_comment': ts.instructor_comments,
                'activities': {'student': student_acts, 'instructor': instructor_acts}
            })
        
        prev_student_acts = student_acts
        prev_instructor_acts = instructor_acts
    
    # Determine dominant activities
    dominant_student = max(student_activity_counts.items(), key=lambda x: x[1]) if student_activity_counts else (None, 0)
    dominant_instructor = max(instructor_activity_counts.items(), key=lambda x: x[1]) if instructor_activity_counts else (None, 0)
    
    # Calculate engagement level based on activity diversity
    student_diversity = len(student_activity_counts)
    instructor_diversity = len(instructor_activity_counts)
    
    if student_diversity <= 1 and instructor_diversity <= 1:
        engagement_level = 'Low - Single activity pattern'
    elif student_diversity <= 2 and instructor_diversity <= 2:
        engagement_level = 'Moderate - Limited activity variety'
    else:
        engagement_level = 'High - Diverse activity patterns'
    
    return {
        'total_entries': total_entries,
        'dominant_student_activity': dominant_student,
        'dominant_instructor_activity': dominant_instructor,
        'student_activity_counts': student_activity_counts,
        'instructor_activity_counts': instructor_activity_counts,
        'activity_transitions': transitions,
        'engagement_level': engagement_level,
        'specific_observations': specific_observations
    }

# ---------- ENHANCED PROMPT FORMULATION ----------
def build_copus_prompt_from_timestamps(evaluation, timestamps):
    # Analyze the data first
    analysis = analyze_copus_patterns(timestamps)
    
    # Get session duration if available
    duration_info = ""
    if evaluation.schedule and evaluation.schedule.start_time and evaluation.schedule.end_time:
        duration = evaluation.get_duration()
        if duration:
            duration_minutes = int(duration.total_seconds() / 60)
            duration_info = f"Session Duration: {duration_minutes} minutes\n"
    
    # Build enhanced prompt with YAML context validation
    prompt = f"""COPUS EVALUATION CONTEXT (from YAML configuration):
{COPUS_CODE_EXPLANATION}

FEEDBACK REQUIREMENTS (from YAML configuration):
{FEEDBACK_INSTRUCTIONS}

CLASSROOM OBSERVATION DATA ANALYSIS:
{duration_info}Total Observation Points: {analysis['total_entries']}
Activity Transitions: {analysis['activity_transitions']}
Engagement Level: {analysis['engagement_level']}

SPECIFIC DATA PATTERNS IDENTIFIED:
- Dominant Student Activity: {analysis['dominant_student_activity'][0]} (occurred {analysis['dominant_student_activity'][1]} times)
- Dominant Instructor Activity: {analysis['dominant_instructor_activity'][0]} (occurred {analysis['dominant_instructor_activity'][1]} times)
- Student Activity Distribution: {dict(analysis['student_activity_counts'])}
- Instructor Activity Distribution: {dict(analysis['instructor_activity_counts'])}

RAW OBSERVATION DATA:
"""
    
    if not timestamps:
        prompt += "- No classroom data detected.\n"
    else:
        for i, ts in enumerate(timestamps):
            student_acts = ", ".join([k for k, v in (ts.student_activities or {}).items() if v])
            instructor_acts = ", ".join([k for k, v in (ts.instructor_activities or {}).items() if v])
            prompt += f"Row {i+1}: Time: {ts.time_record}, Student: [{student_acts}], Instructor: [{instructor_acts}]"
            if ts.student_comments:
                prompt += f", Student Comments: {ts.student_comments}"
            if ts.instructor_comments:
                prompt += f", Instructor Comments: {ts.instructor_comments}"
            prompt += "\n"
    
    # Add specific observations if any
    if analysis['specific_observations']:
        prompt += "\nSPECIFIC COMMENTS FROM OBSERVATION:\n"
        for obs in analysis['specific_observations']:
            prompt += f"- At {obs['time']}: {obs['student_comment'] or obs['instructor_comment']}\n"
    
    # Enhanced instructions to prevent generic responses
    prompt += f"""
CRITICAL ANALYSIS REQUIREMENTS:
1. MANDATORY: Reference the specific data patterns above (dominant activities, transition count, engagement level)
2. MANDATORY: Quote specific times and activities from the raw data
3. MANDATORY: Base ALL recommendations on the actual observed patterns, not generic teaching advice
4. FORBIDDEN: Do not use generic phrases like "consider incorporating" or "research shows"
5. REQUIRED: Provide evidence-based feedback using the exact activity counts and patterns shown above
6. REQUIRED: Address why the dominant activities ({analysis['dominant_student_activity'][0]} for students, {analysis['dominant_instructor_activity'][0]} for instructor) occurred {analysis['dominant_student_activity'][1]} and {analysis['dominant_instructor_activity'][1]} times respectively

RESPONSE FORMAT REQUIRED:
1. Data-Specific Analysis (reference exact numbers and patterns)
2. Evidence-Based Observations (quote specific times and activities)
3. Tailored Recommendations (based solely on the observed data patterns)
4. End with [END]

EXAMPLE of what NOT to do: "Consider incorporating think-pair-share activities..."
EXAMPLE of what TO do: "Given that students were in 'listening' mode for all {analysis['total_entries']} observation points with zero activity transitions, the specific intervention needed is..."

Begin your data-driven COPUS analysis now:"""
    
    return prompt

def generate_ai_feedback_for_evaluation(evaluation, max_new_tokens=1024, temperature=0.7, max_continues=3):
    """
    Sends a prompt to the HuggingFace Hub InferenceClient and returns the generated feedback.
    Enhanced to ensure data-specific analysis and proper YAML context usage.
    Args:
        evaluation: The evaluation object.
        max_new_tokens: Max tokens per response.
        temperature: Sampling temperature.
        max_continues: Max number of 'continue' prompts.
    Returns:
        dict: The generated feedback with metadata.
    Raises:
        Exception: If the API call fails.
    """
    import re
    timestamp = Timestamp.objects.filter(evaluation=evaluation).order_by('time_record')
    
    # Validate YAML loading
    try:
        yaml_validation = f"YAML Context Loaded: COPUS explanation ({len(COPUS_CODE_EXPLANATION)} chars), Feedback instructions ({len(FEEDBACK_INSTRUCTIONS)} chars)"
        print(yaml_validation)  # For debugging
    except Exception as e:
        raise RuntimeError(f"YAML context validation failed: {e}")
    
    prompt = build_copus_prompt_from_timestamps(evaluation, timestamp)
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("No HuggingFace API key found in environment or settings")

    # Initial request
    feedback = generate_ai_feedback(prompt, api_key, max_new_tokens=max_new_tokens, temperature=temperature)
    
    # Clean up response (remove any echoed prompts)
    feedback = feedback.replace(COPUS_CODE_EXPLANATION.strip(), "").replace(FEEDBACK_INSTRUCTIONS.strip(), "").lstrip()
    # Remove any lines that match the data row format: Row N: Time: ...
    feedback = '\n'.join([
        line for line in feedback.splitlines()
        if not re.match(r"^\s*Row \d+: Time: ", line)
    ])

    # Enhanced continue prompt strategy with context preservation
    continues = 0
    while (
        (
            (len(feedback.split()) > 0 and len(feedback.split()) >= int(0.9 * max_new_tokens)) or
            not feedback.rstrip().endswith(('.', '!', '?'))
        ) and continues < max_continues and '[END]' not in feedback
    ):
        # Get the last sentence for context
        last_sentence = feedback.split('.')[-2] + '.' if '.' in feedback else feedback[-100:]
        
        # Enhanced continue prompt with data context
        continue_prompt = f"""You were providing data-specific COPUS feedback and your last statement was: "{last_sentence.strip()}"

Continue your expert feedback for the classroom observation data, picking up exactly where you left off. 
REMEMBER: Base your continued analysis on the specific data patterns provided (activity counts, transitions, engagement level).
Do not repeat previous content. Be concise but complete. End with [END] when finished."""
        
        next_part = generate_ai_feedback(continue_prompt, api_key, max_new_tokens=max_new_tokens, temperature=temperature)
        feedback += "\n" + next_part.strip()
        continues += 1

    # Remove the custom end token if present
    feedback = feedback.replace('[END]', '').strip()
    
    # Validate that the response contains data-specific content
    data_specific_indicators = ['observation points', 'times', 'transitions', 'pattern', 'specific', 'data shows']
    has_data_specific_content = any(indicator in feedback.lower() for indicator in data_specific_indicators)
    
    return {
        "feedback": feedback,
        "metadata": {
            "continues_used": continues,
            "yaml_context_loaded": True,
            "data_specific_analysis": has_data_specific_content,
            "total_tokens_estimated": len(feedback.split())
        }
    }