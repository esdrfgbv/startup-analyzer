from utils.llm import ask_llm, safe_json_parse
import json

def validator_agent(market, competitors, pain_points, timing, red_team):
    prompt = f"""
You are a data validator. Cross-check these 5 research outputs for consistency and assign confidence scores.

Market Data: {json.dumps(market)}
Competitor Data: {json.dumps(competitors)}
Pain Points: {json.dumps(pain_points)}
Timing Data: {json.dumps(timing)}
Red Team Data: {json.dumps(red_team)}

Return ONLY valid JSON.

{{
  "overall_confidence": 78,
  "market_confidence": 82,
  "competitor_confidence": 85,
  "pain_point_confidence": 79,
  "timing_confidence": 71,
  "contradictions": ["any contradiction found between sources"],
  "validated": true
}}

overall_confidence is 0-100 weighted average. Set validated to false if fatal contradictions exist.
"""
    return safe_json_parse(ask_llm(prompt, agent_type="critic"))
