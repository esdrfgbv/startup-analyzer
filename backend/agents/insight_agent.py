from utils.llm import ask_llm

def insight_agent(data):
    prompt = f"""
    Analyze this data and extract insights:

    {data}

    Give 3 strong insights with reasoning.
    """

    return safe_json_parse(ask_llm(prompt, agent_type="analysis"))