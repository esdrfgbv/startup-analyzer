import streamlit as st
import requests
import pandas as pd

st.set_page_config(page_title="AI Startup Decision Engine", page_icon="🚀", layout="wide")

st.title("🚀 AI Startup Decision Engine")
st.caption("Multi-agent AI analysis • Powered by Groq + LLaMA 3.3")

# ── INPUT FORM ──────────────────────────────────────────────────────────────
with st.form("analyze_form"):
    col1, col2 = st.columns(2)
    with col1:
        idea    = st.text_input("💡 Startup Idea",     placeholder="e.g. AI-powered HR onboarding tool")
        country = st.text_input("🌍 Target Country",   placeholder="e.g. India")
    with col2:
        audience = st.text_input("👥 Target Audience", placeholder="e.g. SME HR managers")
        pricing  = st.text_input("💰 Pricing Model",   placeholder="e.g. ₹999/month SaaS")
    submitted = st.form_submit_button("🔍 Analyze My Startup", use_container_width=True)

if not submitted:
    st.stop()

if not idea or not country or not audience:
    st.warning("⚠️ Please fill in Idea, Country, and Audience.")
    st.stop()

# ── CALL BACKEND ─────────────────────────────────────────────────────────────
with st.spinner("Running 6 AI agents… ~30 seconds ⏳"):
    try:
        resp = requests.post(
            "http://127.0.0.1:8000/analyze",
            json={"idea": idea, "country": country, "audience": audience, "pricing": pricing},
            timeout=180,
        )
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot reach backend. Run: `uvicorn main:app --reload --app-dir backend`")
        st.stop()

if resp.status_code != 200:
    st.error(f"❌ Backend returned HTTP {resp.status_code}")
    st.stop()

data = resp.json()

if "error" in data:
    st.error(f"❌ Backend error: {data['error']}")
    with st.expander("Traceback"):
        st.code(data.get("trace", ""))
    st.stop()

research   = data.get("research",   {})
simulation = data.get("simulation", {})
decision   = data.get("decision",   {})
risks      = data.get("risks",      "")
strategy   = data.get("strategy",   "")
insights   = data.get("insights",   "")

# ── VERDICT BANNER ────────────────────────────────────────────────────────────
verdict    = decision.get("verdict", "UNKNOWN") if isinstance(decision, dict) else "UNKNOWN"
confidence = decision.get("confidence", 0)      if isinstance(decision, dict) else 0
justification = decision.get("justification","") if isinstance(decision, dict) else str(decision)

color = {"GO": "🟢", "CONDITIONAL GO": "🟡", "NO-GO": "🔴"}.get(verdict, "⚪")
st.markdown("---")
st.markdown(f"## {color} Verdict: **{verdict}**  —  Confidence: {confidence}%")
if justification:
    st.info(justification)
st.markdown("---")

# ── KPI CARDS ─────────────────────────────────────────────────────────────────
st.subheader("📊 Key Metrics")
k1, k2, k3, k4 = st.columns(4)
k1.metric("Market Size",      research.get("market_size", "N/A"))
k2.metric("Growth Rate",      research.get("growth_rate", "N/A"))
k3.metric("Success Chance",   f"{simulation.get('success_probability', '?')}%")
k4.metric("Risk Level",       simulation.get("risk_level", "N/A"))

st.markdown("---")

# ── COMPETITOR CHART ──────────────────────────────────────────────────────────
competitors = research.get("competitors", [])
if competitors and isinstance(competitors, list) and len(competitors) > 0:
    try:
        comp_df = pd.DataFrame(competitors)
        if "name" in comp_df.columns and "strength" in comp_df.columns:
            st.subheader("🏆 Competitor Strength")
            st.bar_chart(comp_df.set_index("name")["strength"])
            with st.expander("Competitor Details"):
                st.dataframe(comp_df, use_container_width=True)
    except Exception:
        pass

# ── PAIN POINTS ───────────────────────────────────────────────────────────────
pain_points = research.get("pain_points", [])
if pain_points:
    st.subheader("😤 Customer Pain Points")
    pain_df = pd.DataFrame({"Pain Points": pain_points})
    st.table(pain_df)

# ── SIMULATION BREAKDOWN ──────────────────────────────────────────────────────
st.subheader("🔄 Simulation")
s1, s2 = st.columns(2)
with s1:
    prob = simulation.get("success_probability", 0)
    st.metric("Success Probability", f"{prob}%")
    st.progress(min(int(prob), 100))
    st.metric("Adoption Rate", simulation.get("adoption_rate", "N/A"))
with s2:
    reasoning = simulation.get("reasoning", [])
    if reasoning:
        st.markdown("**Reasoning:**")
        for r in reasoning:
            st.markdown(f"- {r}")
    opt_price    = simulation.get("optimized_pricing", "")
    opt_strategy = simulation.get("optimized_strategy", "")
    if opt_price:
        st.markdown(f"**💡 Better Pricing:** {opt_price}")
    if opt_strategy:
        st.markdown(f"**🎯 Better Strategy:** {opt_strategy}")

pricing_info = research.get("pricing", {})
if pricing_info:
    st.caption(f"Market avg price: {pricing_info.get('average_price','?')}  |  Affordability: {pricing_info.get('affordability','?')}")

# ── TEXT SECTIONS ─────────────────────────────────────────────────────────────
st.markdown("---")
tab1, tab2, tab3 = st.tabs(["🧠 Insights", "⚠️ Risks", "🎯 Strategy"])
with tab1:
    st.write(insights or "No insights returned.")
with tab2:
    st.write(risks or "No risk analysis returned.")
with tab3:
    st.write(strategy or "No strategy returned.")