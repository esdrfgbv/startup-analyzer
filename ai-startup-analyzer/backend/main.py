import json
import traceback
from fastapi import FastAPI
from agents.research_agent import research_agent
from agents.analyst_agent import analyst_agent
from agents.critic_agent import critic_agent
from agents.synthesizer_agent import synthesizer_agent
from agents.simulation_agent import simulation_agent

app = FastAPI()


@app.post("/analyze")
def analyze(data: dict):
    try:
        idea     = data["idea"]
        country  = data["country"]
        audience = data["audience"]
        pricing  = data.get("pricing", "unknown")

        # ── 4-agent reasoning pipeline ──────────────────────────────────────
        research   = research_agent(idea, country, audience)   # facts
        insights   = analyst_agent(research)                   # interpret
        risks      = critic_agent(research, insights)          # attack
        final      = synthesizer_agent(research, insights, risks)  # synthesize
        simulation = simulation_agent(idea, pricing)           # pricing sim

        return {
            "research":   research,
            "insights":   insights,
            "risks":      risks,
            "final":      final,
            "simulation": simulation,
        }

    except Exception as e:
        return {"error": str(e), "trace": traceback.format_exc()}