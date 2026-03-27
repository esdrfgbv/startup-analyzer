from utils.llm import ask_llm, safe_json_parse

def pain_point_agent(idea, region, segment, focus=""):
    prompt = f"""
You are a customer research expert. Identify specific, real customer frustrations.

Startup: {idea}
Region: {region}
Segment: {segment}
Focus: {focus}

Return ONLY valid JSON. Be specific and actionable.

{{
  "pain_points": [
    {{
      "problem": "specific customer frustration",
      "frequency": "how often customers experience this: Always/Often/Sometimes",
      "severity": "impact level: Critical/High/Medium/Low",
      "current_solution": "what they use now (and why it fails)",
      "opportunity": "how your startup can solve this"
    }}
  ]
}}

Return exactly 5 pain points ordered by severity (Critical first).
Include a "sources" key at the root of the JSON with a list of 2-3 specific URLs or source names used.
"""
    return safe_json_parse(ask_llm(prompt, agent_type="research"))
