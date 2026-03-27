from utils.llm import ask_llm, safe_json_parse

def market_sizer_agent(idea, region, segment, focus=""):
    prompt = f"""
You are a market research expert. Provide realistic, specific market size data.

Startup: {idea}
Region: {region}
Segment: {segment}
Focus: {focus}

Return ONLY valid JSON. Use realistic figures with units (e.g. "$4.2B", "23%").

{{
  "tam": "Total Addressable Market with value",
  "sam": "Serviceable Addressable Market with value",
  "som": "Serviceable Obtainable Market with value",
  "cagr": "Compound Annual Growth Rate percentage",
  "market_stage": "emerging/growing/mature/declining",
  "five_year_projection": "market size in 5 years",
  "confidence": 82,
  "sources": ["list of 2-3 specific URLs or source names used for this data"]
}}
"""
    return safe_json_parse(ask_llm(prompt, agent_type="research"))
