from utils.llm import ask_llm, safe_json_parse

def red_team_agent(idea, region, segment, focus=""):
    prompt = f"""
You are a ruthless startup killer. Your job is to destroy every assumption in this idea.
Be brutal, specific, and honest. Do not be polite.

Startup: {idea}
Region: {region}
Segment: {segment}
Focus: {focus}

Return ONLY valid JSON.

{{
  "kill_reasons": [
    {{
      "category": "Market / Competition / Execution / Regulation / Timing / Unit Economics",
      "severity": "Fatal/Critical/High/Medium",
      "assumption": "the assumption being challenged",
      "detail": "why this kills the startup specifically",
      "counter": "only if there's a credible counter-argument"
    }}
  ],
  "fatal_flaw": "the single most likely reason this startup dies",
  "survival_probability": 35
}}

Return exactly 5 kill reasons (severest first). survival_probability is 0-100.
"""
    return safe_json_parse(ask_llm(prompt, agent_type="critic"))
