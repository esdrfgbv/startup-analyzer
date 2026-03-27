from utils.llm import ask_llm

def risk_agent(data):
    prompt = f"""
You are a brutal startup analyst.

Analyze this:

{data}

Return ONLY:

## RISK ANALYSIS
- Risk 1: <reason>
- Risk 2: <reason>
- Risk 3: <reason>

## FAILURE VERDICT
- Why this startup will fail (clear, harsh)
"""
    return safe_json_parse(ask_llm(prompt, agent_type="critic"))