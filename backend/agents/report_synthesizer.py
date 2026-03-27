from utils.llm import ask_llm, safe_json_parse
import json

def report_synthesizer(idea, region, segment, market, competitors, pain_points, timing, red_team, validation):
    prompt = f"""
You are a senior startup consultant writing an executive intelligence report.

Startup: {idea}
Region: {region}
Segment: {segment}

Raw Data:
Market: {json.dumps(market)}
Competitors: {json.dumps(competitors)}
Pain Points: {json.dumps(pain_points)}
Timing: {json.dumps(timing)}
Red Team: {json.dumps(red_team)}

Return ONLY valid JSON.

{{
  "gtm": {{
    "beachhead": "specific first target market",
    "channel": "how to reach first customers",
    "pricing": "recommended model and price point",
    "first_100": "playbook for first 100 customers",
    "month1_metric": "key metric to track",
    "biggest_risk": "top risk to monitor"
  }},
  "all_sources": ["a unique, unified list of all URLs and sources from the raw data provided"]
}}

verdict must be exactly: GO, CONDITIONAL GO, or NO-GO
"""
    return safe_json_parse(ask_llm(prompt, agent_type="analysis"))
