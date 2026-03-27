import json
import asyncio
import traceback
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from agents.orchestrator_agent import orchestrator_agent
from agents.market_sizer_agent import market_sizer_agent
from agents.competitor_scout_agent import competitor_scout_agent
from agents.pain_point_agent import pain_point_agent
from agents.timing_agent import timing_agent
from agents.red_team_agent import red_team_agent
from agents.validator_agent import validator_agent
from agents.report_synthesizer import report_synthesizer
from agents.debate_agent import debate_agent
from agents.shark_tank_agent import shark_tank_first_question, shark_tank_followup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache: key = "idea|region|segment"
_cache: dict = {}
_executor = ThreadPoolExecutor(max_workers=6)

def _run_in_thread(fn, *args):
    """Run a blocking LLM call in a thread so asyncio doesn't block."""
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(_executor, fn, *args)


def _evt(agent: str, status: str, data=None):
    payload = {"agent": agent, "status": status}
    if data is not None:
        payload["data"] = data
    return json.dumps(payload)


@app.get("/api/stream")
async def stream_analysis(idea: str, region: str, segment: str):
    cache_key = f"{idea}|{region}|{segment}"

    async def event_generator():
        # ── Serve from cache if available ──────────────────────────────────
        if cache_key in _cache:
            yield {"data": _evt("cache", "hit", _cache[cache_key])}
            return

        try:
            # ── STEP 1: Orchestrator ─────────────────────────────────────
            yield {"data": _evt("orchestrator", "running")}
            missions = await _run_in_thread(orchestrator_agent, idea, region, segment)
            yield {"data": _evt("orchestrator", "done")}

            # ── STEP 2: 5 Specialist Agents in parallel ──────────────────
            yield {"data": _evt("market_sizer",      "running")}
            yield {"data": _evt("competitor_scout",  "running")}
            yield {"data": _evt("pain_point",        "running")}
            yield {"data": _evt("timing",            "running")}
            yield {"data": _evt("red_team",          "running")}

            market_fut      = _run_in_thread(market_sizer_agent,     idea, region, segment, missions.get("market_size_focus", ""))
            competitor_fut  = _run_in_thread(competitor_scout_agent, idea, region, segment, missions.get("competitor_focus", ""))
            pain_fut        = _run_in_thread(pain_point_agent,       idea, region, segment, missions.get("pain_point_focus", ""))
            timing_fut      = _run_in_thread(timing_agent,           idea, region, segment, missions.get("timing_focus", ""))
            red_team_fut    = _run_in_thread(red_team_agent,         idea, region, segment, missions.get("red_team_focus", ""))

            market, competitors, pain_points, timing_data, red_team = await asyncio.gather(
                market_fut, competitor_fut, pain_fut, timing_fut, red_team_fut
            )

            yield {"data": _evt("market_sizer",     "done", market)}
            yield {"data": _evt("competitor_scout", "done", competitors)}
            yield {"data": _evt("pain_point",       "done", pain_points)}
            yield {"data": _evt("timing",           "done", timing_data)}
            yield {"data": _evt("red_team",         "done", red_team)}

            # ── STEP 3: Validator ────────────────────────────────────────
            yield {"data": _evt("validator", "running")}
            validation = await _run_in_thread(
                validator_agent, market, competitors, pain_points, timing_data, red_team
            )
            yield {"data": _evt("validator", "done", validation)}

            # ── STEP 4: Report Synthesizer ───────────────────────────────
            yield {"data": _evt("synthesizer", "running")}
            report = await _run_in_thread(
                report_synthesizer,
                idea, region, segment,
                market, competitors, pain_points, timing_data, red_team, validation
            )
            yield {"data": _evt("synthesizer", "done")}

            # ── STEP 5: Debate Agents ────────────────────────────────────
            yield {"data": _evt("debate", "running")}
            debate = await _run_in_thread(
                debate_agent, idea, region, segment, report
            )
            yield {"data": _evt("debate", "done", debate)}

            # ── Final payload ─────────────────────────────────────────────
            full_result = {
                "market":       market,
                "competitors":  competitors,
                "pain_points":  pain_points,
                "timing":       timing_data,
                "red_team":     red_team,
                "validation":   validation,
                "report":       report,
                "debate":       debate,
            }
            _cache[cache_key] = full_result
            yield {"data": _evt("complete", "done", full_result)}

        except Exception as e:
            yield {"data": _evt("error", "failed", {"error": str(e), "trace": traceback.format_exc()})}

    return EventSourceResponse(event_generator())


@app.post("/api/shark-tank/start")
async def shark_tank_start(body: dict):
    idea    = body.get("idea", "")
    region  = body.get("region", "")
    segment = body.get("segment", "")
    cache_key = f"{idea}|{region}|{segment}"
    report_summary = ""
    if cache_key in _cache:
        report = _cache[cache_key].get("report", {})
        report_summary = json.dumps(report)[:800]

    loop = asyncio.get_event_loop()
    q = await loop.run_in_executor(
        _executor, shark_tank_first_question, idea, region, segment, report_summary
    )
    return {"question": q, "turn": 1}


@app.post("/api/shark-tank/reply")
async def shark_tank_reply(body: dict):
    idea     = body.get("idea", "")
    answer   = body.get("answer", "")
    turn     = body.get("turn", 1)
    history  = body.get("history", [])

    loop = asyncio.get_event_loop()
    reply = await loop.run_in_executor(
        _executor, shark_tank_followup, idea, history, answer, turn
    )
    return {"reply": reply, "turn": turn, "final": turn >= 5}


@app.post("/api/whatif")
async def whatif(body: dict):
    """Re-run specific agents for What-If simulation."""
    idea    = body.get("idea", "")
    region  = body.get("region", "")
    segment = body.get("segment", "")
    pricing = body.get("pricing", "")
    agent   = body.get("agent", "market")

    loop = asyncio.get_event_loop()
    if agent == "market":
        result = await loop.run_in_executor(_executor, market_sizer_agent, idea, region, segment, f"pricing: {pricing}")
    elif agent == "competitor":
        result = await loop.run_in_executor(_executor, competitor_scout_agent, idea, region, segment, f"pricing: {pricing}")
    else:
        result = await loop.run_in_executor(_executor, pain_point_agent, idea, region, segment, "")
    return result