from utils.llm import ask_llm, safe_json_parse
import json

def synthesizer_agent(research, insights, risks):
    prompt = f"""
You are a senior startup advisor. Combine everything into a final verdict.

Research:
{json.dumps(research, indent=2)}

Analyst Insights:
{json.dumps(insights, indent=2)}

Critic Risks:
{json.dumps(risks, indent=2)}

Return ONLY valid JSON. No markdown, no code fences.

{{
  "decision": "GO",
  "confidence": 75,
  "reason": "short justification",
  "strategy": [
    "actionable step 1",
    "actionable step 2",
    "actionable step 3"
  ]
}}

decision must be exactly: GO, CONDITIONAL GO, or NO-GO
confidence is 0-100
"""
    return safe_json_parse(ask_llm(prompt, agent_type="analysis"))
