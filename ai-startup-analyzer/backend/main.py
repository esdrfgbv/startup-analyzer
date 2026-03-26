import json
from fastapi import FastAPI
from agents.research_agent import research_agent
from agents.insight_agent import insight_agent
from agents.risk_agent import risk_agent
from agents.strategy_agent import strategy_agent
from agents.simulation_agent import simulation_agent
from agents.decision_agent import decision_agent

app = FastAPI()

@app.post("/analyze")
def analyze(data: dict):
    try:
        idea = data["idea"]
        country = data["country"]
        audience = data["audience"]
        pricing = data.get("pricing", "unknown")

        research   = research_agent(idea, country, audience)
        insights   = insight_agent(json.dumps(research))
        risks      = risk_agent(json.dumps(research))
        strategy   = strategy_agent(json.dumps(research))
        simulation = simulation_agent(idea, pricing)

        all_data = json.dumps({
            "research": research,
            "simulation": simulation,
            "risks": risks,
            "strategy": strategy,
        })
        decision = decision_agent(all_data)

        return {
            "research":   research,
            "simulation": simulation,
            "risks":      risks,
            "strategy":   strategy,
            "insights":   insights,
            "decision":   decision,
        }

    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}