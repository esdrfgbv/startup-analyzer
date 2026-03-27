from utils.llm import ask_llm
import json

INVESTOR_SYSTEM = """You are a tough Silicon Valley investor on Shark Tank.
You have seen 10,000 pitches. You are direct, skeptical, and sharp.
You ask one hard question at a time. You push back when answers are weak.
You make your final verdict after 5 exchanges: "I'm IN / I'm OUT / Needs more validation."
Keep each response to 2-3 sentences maximum."""

def shark_tank_first_question(idea, region, segment, report_summary):
    prompt = f"""{INVESTOR_SYSTEM}

The founder is pitching: {idea} (Region: {region}, Segment: {segment})
Report says: {report_summary[:600]}

Ask your first hard question. Make it about the biggest weakness in the report.
"""
    return ask_llm(prompt, agent_type="shark_tank")

def shark_tank_followup(idea, conversation_history, answer, turn_number):
    history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in conversation_history])
    prompt = f"""{INVESTOR_SYSTEM}

Startup: {idea}
Conversation so far:
{history_text}

Founder just answered: {answer}

This is turn {turn_number} of 5.
{"Give your FINAL VERDICT: I'm IN / I'm OUT / Needs more validation, with a 2-sentence reason." if turn_number >= 5 else "Push back or ask your next hard question. One question only."}
"""
    return ask_llm(prompt, agent_type="shark_tank")
