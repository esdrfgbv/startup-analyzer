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

    return ask_llm(prompt)