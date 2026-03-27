from utils.llm import ask_llm
import json

def debate_agent(idea, region, segment, report_context):
    """Returns Bull, Bear, Realist messages as a list of debate turns."""
    context = json.dumps(report_context) if isinstance(report_context, dict) else str(report_context)

    bull_prompt = f"""
You are the BULL AGENT in a startup debate. You are EXTREMELY optimistic and data-driven.
You genuinely believe this is a goldmine opportunity.

Startup: {idea} | Region: {region} | Segment: {segment}
Report context: {context}

Write a compelling, energetic argument for WHY this startup will WIN.
Be specific. Use the data. 3-4 sentences max. Start with "🟢 BULL:"
"""
    bear_prompt_template = """
You are the BEAR AGENT in a startup debate. You are BRUTAL and skeptical.
You've seen 1000 startups fail and you see every flaw.

The Bull just said: {bull_msg}

Startup: {idea} | Region: {region}
Report context: {context}

Destroy the Bull's argument. Be specific about what will go wrong.
3-4 sentences. Start with "🔴 BEAR:"
"""
    realist_prompt_template = """
You are the REALIST AGENT. You synthesize both views into actionable truth.
You are the wisest person in the room.

Bull said: {bull_msg}
Bear said: {bear_msg}

Startup: {idea} | Region: {region}

Give the honest, balanced take. What SHOULD the founder do?
3-4 sentences. Start with "🟡 REALIST:"
"""

    bull_msg  = ask_llm(bull_prompt, model="gpt-4o")
    bear_msg  = ask_llm(bear_prompt_template.format(
        bull_msg=bull_msg, idea=idea, region=region, context=context[:500]
    ), model="claude-3-5-sonnet-20241022")
    realist_msg = ask_llm(realist_prompt_template.format(
        bull_msg=bull_msg, bear_msg=bear_msg, idea=idea, region=region
    ), model="gpt-4o")

    return [
        {"role": "bull",    "message": bull_msg},
        {"role": "bear",    "message": bear_msg},
        {"role": "realist", "message": realist_msg},
    ]
