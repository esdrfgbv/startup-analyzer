from utils.llm import ask_llm, safe_json_parse

def decision_agent(all_data):
    prompt = f"""
Return ONLY valid JSON. No markdown, no explanation, no code fences.

{{
  "verdict": "GO",
  "confidence": 0,
  "justification": ""
}}

verdict must be exactly one of: GO, CONDITIONAL GO, NO-GO
confidence is 0-100

Based on:
{all_data}
"""
    return safe_json_parse(ask_llm(prompt))