from utils.llm import ask_llm, safe_json_parse

def research_agent(idea, country, audience):
    prompt = f"""
Return ONLY valid JSON. No markdown, no explanation, no code fences.

{{
  "market_size": "",
  "growth_rate": "",
  "competitors": [
    {{"name": "", "pricing": "", "strength": 0}}
  ],
  "pricing": {{
    "average_price": "",
    "affordability": ""
  }},
  "pain_points": []
}}

Analyze:
Idea: {idea}
Country: {country}
Audience: {audience}
"""
    return safe_json_parse(ask_llm(prompt, agent_type="research"))