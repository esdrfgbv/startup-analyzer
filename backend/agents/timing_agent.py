from utils.llm import ask_llm, safe_json_parse

def timing_agent(idea, region, segment, focus=""):
    prompt = f"""
You are a market timing expert. Analyze whether now is the right time for this startup.

Startup: {idea}
Region: {region}
Segment: {segment}
Focus: {focus}

Return ONLY valid JSON.

{{
  "timing_verdict": "Too Early / Right Time / Too Late",
  "timing_score": 75,
  "signals": [
    {{
      "signal": "description of timing signal",
      "type": "positive/negative/neutral",
      "impact": "High/Medium/Low"
    }}
  ],
  "risk_level": "Low/Medium/High",
  "window": "how long the timing window is open",
  "urgency": "act now / 6-12 months / not urgent"
}}

timing_score is 0-100 (100 = perfect timing right now).
Return exactly 4 signals.
Include a "sources" key at the root of the JSON with a list of 2-3 specific URLs or source names used.
"""
    return safe_json_parse(ask_llm(prompt, agent_type="research"))
