from utils.llm import ask_llm

def strategy_agent(data):
    prompt = f"""
    Based on this startup data:

    {data}

    Suggest:
    - market entry strategy
    - pricing strategy
    - differentiation ideas
    """

    return safe_json_parse(ask_llm(prompt, agent_type="analysis"))