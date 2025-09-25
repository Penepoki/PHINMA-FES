import os

import re
import html

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

# ---------- RETENTION RECOMMENDATIONS (Lean Six Sigma) ----------
from collections import defaultdict
from statistics import mean
from hrapp.models.evaluation_models import ScatterPlotAnalytics

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


def _summarize_retention_series(entries):
    series = defaultdict(list)  # key -> list[float]
    chronology = defaultdict(list)  # key -> list[datetime]
    for e in entries:
        key = f"{getattr(e, 'year', 'Unknown')}-{getattr(e, 'semester', 'Unknown')}"
        try:
            rr = float(e.retention_rate or 0)
        except Exception:
            rr = 0.0
        series[key].append(rr)
        chronology[key].append(e.created_at)

    per_series = {}
    for key, vals in series.items():
        if not vals:
            continue
        try:
            avg = float(mean(vals))
        except Exception:
            avg = sum(vals) / max(len(vals), 1)
        last = vals[-1]
        _min = min(vals)
        _max = max(vals)
        trend = None
        if len(vals) >= 2:
            trend = vals[-1] - vals[0]
        per_series[key] = {
            "count": len(vals),
            "avg": round(avg, 3),
            "last": round(float(last), 3),
            "min": round(float(_min), 3),
            "max": round(float(_max), 3),
            "trend": round(float(trend), 3) if trend is not None else None,
            "first_ts": min(chronology[key]) if chronology[key] else None,
            "last_ts": max(chronology[key]) if chronology[key] else None,
        }

    # overall
    all_vals = [v for vals in series.values() for v in vals]
    overall = {
        "count": len(all_vals),
        "avg": round(float(mean(all_vals)), 3) if all_vals else 0.0,
        "min": round(min(all_vals), 3) if all_vals else 0.0,
        "max": round(max(all_vals), 3) if all_vals else 0.0,
    }
    return per_series, overall


def build_retention_prompt(entries):
    per_series, overall = _summarize_retention_series(entries)

    lines = []
    lines.append("LEAN SIX SIGMA CONTEXT: You are an LSS Black Belt advising an academic unit on student retention.")
    lines.append("Use DMAIC thinking, quantify impact, and focus on CTQs (Critical-To-Quality) like Retention Rate, Response Participation, and Early Intervention KPIs.")
    lines.append("")
    lines.append("RETENTION DATA SNAPSHOT (Saved ScatterPlotAnalytics):")
    lines.append(f"Overall: count={overall['count']}, avg={overall['avg']}%, min={overall['min']}%, max={overall['max']}%")
    for key, stats in sorted(per_series.items()):
        lines.append(
            f"- {key}: n={stats['count']}, last={stats['last']}%, avg={stats['avg']}%, min={stats['min']}%, max={stats['max']}%, trend={stats['trend']}% (last-first)"
        )

    lines.append("")
    lines.append("RECOMMENDATION REQUIREMENTS:")
    lines.append("- Provide at least 5 prioritized, actionable recommendations. If data is extremely limited, provide at least 3 and state 'Limited data' as the reason for fewer items.")
    lines.append("- For each, include: DMAIC phase focus, Root-cause hypothesis (5 Whys/Fishbone), Metric to track (CTQ/KPI), Expected retention lift (ballpark), and First experiment to run.")
    lines.append("- Cite specific series (e.g., '2nd-1st') and reference their stats (last/avg/trend).")
    lines.append("- Keep each recommendation 90–150 words; avoid generic statements; be concrete and measurable.")
    lines.append("- Conclude with a 3-step 90-day roadmap.")
    lines.append("")
    lines.append("OUTPUT FORMAT (strict):")
    lines.append("1) <concise action>")
    lines.append("   • DMAIC: <phase>")
    lines.append("   • Root-cause hypothesis: <5 Whys/Fishbone insight>")
    lines.append("   • Metric (CTQ/KPI): <what to track>")
    lines.append("   • Expected retention lift: <ballpark %>")
    lines.append("   • First experiment: <specific, testable step>")
    lines.append("[Repeat up to 5 items]")
    lines.append("")
    lines.append("90-day roadmap:")
    lines.append("- Weeks 1–4: <actions>")
    lines.append("- Weeks 5–8: <actions>")
    lines.append("- Weeks 9–12: <actions>")
    lines.append("")
    lines.append("Write in plain text with consistent bullets (•) and compact paragraphs. Avoid markdown tables.")
    lines.append("Start now.")

    return "\n".join(lines)



def _normalize_recommendations_text(text: str) -> str:
    """Normalize AI text: clean spacing, standardize bullets/numbering, and indentation."""
    if not text:
        return ""
    s = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    lines = s.split("\n")
    out = []
    for line in lines:
        raw = line.rstrip()
        l = raw.strip()
        if not l:
            if out and out[-1] != "":
                out.append("")
            continue
        # Standardize numbering to `N)`
        m = re.match(r"^(\d+)[\.)]\s*(.*)$", l)
        if m:
            idx, rest = m.groups()
            # Remove leading 'Title:' label if present (case-insensitive)
            rest = re.sub(r"^\s*Title:\s*", "", rest, flags=re.IGNORECASE)
            if out and out[-1] != "":
                out.append("")
            out.append(f"{idx}) {rest}".strip())
            continue
        # Normalize bullets to `•` and indent
        if re.match(r"^[-*•]\s+", l):
            l = re.sub(r"^[-*•]\s+", "• ", l)
            out.append("  " + l)
            continue
        out.append(l)
    formatted = "\n".join(out)
    # Collapse 3+ blank lines into 1
    formatted = re.sub(r"\n{3,}", "\n\n", formatted).strip()
    return formatted


def _build_recommendations_html(text_block: str) -> str:
    lines = text_block.split("\n")
    html_lines = []
    for raw in lines:
        m = re.match(r"^(\d+)\)\s+(.*)$", raw)
        if m:
            idx, rest = m.groups()
            rest = re.sub(r"^\s*Title:\s*", "", rest, flags=re.IGNORECASE)
            html_lines.append(f"{idx}) <strong>{html.escape(rest)}</strong>")
            continue
        mb = re.match(r"^(\s*)•\s+(.*)$", raw)
        if mb:
            indent, rest = mb.groups()
            colon_idx = rest.find(":")
            if colon_idx != -1:
                label = rest[: colon_idx + 1]
                val = rest[colon_idx + 1 :]
                html_lines.append(f"{html.escape(indent)}• <strong>{html.escape(label)}</strong>{html.escape(val)}")
            else:
                parts = rest.split(None, 1)
                if parts:
                    label = parts[0]
                    val = parts[1] if len(parts) > 1 else ""
                    html_lines.append(f"{html.escape(indent)}• <strong>{html.escape(label)}</strong>{html.escape(val)}")
                else:
                    html_lines.append(html.escape(raw))
            continue
        html_lines.append(html.escape(raw))
    html_joined = "\n".join(html_lines)
    return f'<div class="ai-recommendation"><pre>{html_joined}</pre></div>'


def generate_retention_recommendations(max_new_tokens: int = 900, temperature: float = 0.45):
    """Generate Lean Six Sigma recommendations from saved retention entries with robust error handling."""
    entries = list(ScatterPlotAnalytics.objects.all().order_by('created_at'))
    if not entries:
        return {
            "recommendations": "No retention entries found. Add entries per year/semester to enable AI guidance.",
            "metadata": {"entries": 0, "success": False, "error": "no_entries"}
        }

    # Prepare prompt and call AI with retries; gracefully degrade on failure
    error = None
    attempts = 0
    text = ""

    # Build prompt
    try:
        prompt = build_retention_prompt(entries)
    except Exception as e:
        error = f"prompt_error: {e}"
        prompt = None

    # Get API key
    api_key = None
    if error is None:
        try:
            api_key = get_api_key()
        except Exception as e:
            error = f"api_key_error: {e}"

    # Call AI with up to 2 attempts
    if error is None and api_key and prompt:
        last_exc = None
        while attempts < 2:
            try:
                text = generate_ai_feedback(prompt, api_key, max_new_tokens=max_new_tokens, temperature=temperature)
                break
            except Exception as e:
                last_exc = e
                attempts += 1
        if not text:
            error = f"ai_generation_error: {last_exc}" if last_exc else "ai_generation_error: unknown"

    # Build formatted output wrapper for better alignment and readability
    width = 88
    header = ("=" * width) + "\n" + "LEAN SIX SIGMA RETENTION RECOMMENDATIONS" + "\n" + ("=" * width)

    if error:
        # Fallback body with guidance and template, no AI content
        body_lines = [
            "AI generation unavailable. Showing fallback guidance.",
            f"Reason: {error}",
            "",
            "Suggested next steps:",
            "1) Verify API connectivity and key configuration.",
            "2) Retry later; the provider may be rate-limiting or unavailable.",
            "3) Ensure retention entries include valid numeric rates.",
            "",
            "Manual template:",
            "1) <concise action>",
            "  • DMAIC: <phase>",
            "  • Root-cause hypothesis: <5 Whys/Fishbone insight>",
            "  • Metric (CTQ/KPI): <what to track>",
            "  • Expected retention lift: <ballpark %>",
            "  • First experiment: <specific, testable step>",
            "",
            "90-day roadmap:",
            "- Weeks 1–4: <actions>",
            "- Weeks 5–8: <actions>",
            "- Weeks 9–12: <actions>",
        ]
        body = "\n".join(body_lines)
    else:
        body = _normalize_recommendations_text(text)

    final_text = f"{header}\n\nRECOMMENDATIONS\n{body}\n\n" + ("=" * width)
    html_block = _build_recommendations_html(final_text)

    return {
        "recommendations": final_text,
        "recommendations_html": html_block,
        "metadata": {
            "entries": len(entries),
            "series_count": len({f"{e.year}-{e.semester}" for e in entries}),
            "generated_tokens_estimate": len(final_text.split()),
            "css_class": "ai-recommendation",
            "css_rules": ".ai-recommendation{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:0.95rem;line-height:1.35;text-align:left}.ai-recommendation pre{margin:0}",
            "success": error is None,
            "error": error,
            "attempts": attempts

        }
    }