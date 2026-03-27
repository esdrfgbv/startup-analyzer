from utils.llm import ask_llm, safe_json_parse

def orchestrator_agent(idea, region, segment):
    prompt = f"""
You are an orchestrator planning a startup market intelligence mission.

Startup Idea: {idea}
Target Region: {region}
Customer Segment: {segment}

Return ONLY valid JSON. No markdown, no code fences.

{{
  "market_size_focus": "specific angle for market sizing research",
  "competitor_focus": "specific type of competitors to look for",
  "pain_point_focus": "specific customer frustration to investigate",
  "timing_focus": "specific timing signals to evaluate",
  "red_team_focus": "key assumptions to challenge"
}}
"""
    return safe_json_parse(ask_llm(prompt, agent_type="analysis"))
