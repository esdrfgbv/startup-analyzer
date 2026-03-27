from utils.llm import ask_llm, safe_json_parse

def competitor_scout_agent(idea, region, segment, focus=""):
    prompt = f"""
You are a competitive intelligence expert. Identify real, specific competitors.

Startup: {idea}
Region: {region}
Segment: {segment}
Focus: {focus}

Return ONLY valid JSON. Be specific with real company names and realistic data.

{{
  "competitors": [
    {{
      "name": "Company Name",
      "funding": "$X million / bootstrapped / public",
      "pricing": "pricing model and range",
      "positioning": "how they position themselves",
      "weakness": "specific exploitable weakness",
      "market_share": "estimated % or description",
      "price_score": 5,
      "feature_score": 7
    }}
  ]
}}

Return exactly 5 competitors. price_score and feature_score are 1-10.
Include a "sources" key at the root of the JSON with a list of 2-3 specific URLs or source names used.
"""
    return safe_json_parse(ask_llm(prompt, agent_type="research"))
