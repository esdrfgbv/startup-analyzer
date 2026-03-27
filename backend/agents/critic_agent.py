from utils.llm import ask_llm, safe_json_parse
import json

def critic_agent(research, insights):
    prompt = f"""
You are a ruthless startup critic. Be specific and harsh.

Research:
{json.dumps(research, indent=2)}

Analyst Insights:
{json.dumps(insights, indent=2)}

Find the real flaws.

Return ONLY valid JSON. No markdown, no code fences.

{{
  "risks": [
    "specific risk 1",
    "specific risk 2",
    "specific risk 3"
  ],
  "fatal_flaw": "single biggest reason this startup will fail"
}}
"""
    return safe_json_parse(ask_llm(prompt, agent_type="critic"))
