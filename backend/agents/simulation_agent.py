from utils.llm import ask_llm, safe_json_parse

def simulation_agent(idea, pricing):
    prompt = f"""
Return ONLY valid JSON. No markdown, no explanation, no code fences.

{{
  "success_probability": 0,
  "adoption_rate": "Low/Medium/High",
  "risk_level": "Low/Medium/High",
  "reasoning": ["point 1", "point 2"],
  "optimized_pricing": "",
  "optimized_strategy": ""
}}

Startup: {idea}
Pricing: {pricing}
"""
    return safe_json_parse(ask_llm(prompt, agent_type="simulation"))