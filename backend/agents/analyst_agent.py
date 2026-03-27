from utils.llm import ask_llm, safe_json_parse
import json

def analyst_agent(research):
    prompt = f"""
You are a business analyst.

Based on this research:
{json.dumps(research, indent=2)}

Return ONLY valid JSON. No markdown, no code fences.

{{
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ],
  "opportunities": [
    "opportunity 1",
    "opportunity 2"
  ]
}}
"""
    return safe_json_parse(ask_llm(prompt, agent_type="analysis"))
