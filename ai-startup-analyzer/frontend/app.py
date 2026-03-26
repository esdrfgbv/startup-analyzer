import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
import networkx as nx
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

st.set_page_config(page_title="AI Startup Decision Engine", page_icon="🚀", layout="wide")

# ── SESSION STATE INIT ────────────────────────────────────────────────────────
# Persist all data here so slider/button interactions don't wipe results
if "result" not in st.session_state:
    st.session_state.result = None
if "idea" not in st.session_state:
    st.session_state.idea = ""
if "country" not in st.session_state:
    st.session_state.country = ""
if "audience" not in st.session_state:
    st.session_state.audience = ""
if "pricing" not in st.session_state:
    st.session_state.pricing = ""
if "sim_result" not in st.session_state:
    st.session_state.sim_result = None

# ── HEADER ────────────────────────────────────────────────────────────────────
st.markdown("# 🚀 AI Startup Decision Engine")
st.caption("Research → Analyst → Critic → Synthesizer · Powered by Groq LLaMA 3.3")
st.markdown("---")

# ── INPUT FORM ────────────────────────────────────────────────────────────────
with st.form("analyze_form"):
    col1, col2 = st.columns(2)
    with col1:
        idea    = st.text_input("💡 Startup Idea",    placeholder="e.g. AI-powered HR onboarding tool")
        country = st.text_input("🌍 Target Country",  placeholder="e.g. India")
    with col2:
        audience = st.text_input("👥 Target Audience", placeholder="e.g. SME HR managers")
        pricing  = st.text_input("💰 Pricing Model",   placeholder="e.g. ₹999/month SaaS")
    submitted = st.form_submit_button("🔍 Analyze My Startup", use_container_width=True)

# ── RUN ANALYSIS (only on form submit) ───────────────────────────────────────
if submitted:
    if not idea or not country or not audience:
        st.warning("⚠️  Please fill Idea, Country, and Audience.")
        st.stop()

    with st.spinner("🧠 AI agents are debating your startup… (~40s)"):
        try:
            resp = requests.post(
                "http://127.0.0.1:8000/analyze",
                json={"idea": idea, "country": country,
                      "audience": audience, "pricing": pricing},
                timeout=240,
            )
        except requests.exceptions.ConnectionError:
            st.error("❌ Backend unreachable. Run: `uvicorn main:app --reload --app-dir backend`")
            st.stop()

    if resp.status_code != 200:
        st.error(f"❌ HTTP {resp.status_code}")
        st.stop()

    data = resp.json()
    if "error" in data:
        st.error(f"❌ {data['error']}")
        with st.expander("Traceback"):
            st.code(data.get("trace", ""))
        st.stop()

    # Store in session_state so it survives slider interactions
    st.session_state.result  = data
    st.session_state.idea    = idea
    st.session_state.country = country
    st.session_state.audience = audience
    st.session_state.pricing = pricing
    st.session_state.sim_result = None  # reset simulation on new analysis

# ── SHOW RESULTS (from session_state) ────────────────────────────────────────
if st.session_state.result is None:
    st.stop()

data       = st.session_state.result
research   = data.get("research",   {})
insights   = data.get("insights",   {})
risks      = data.get("risks",      {})
final      = data.get("final",      {})
simulation = data.get("simulation", {})

verdict    = final.get("decision", "UNKNOWN")
confidence = int(final.get("confidence", 0))
reason     = final.get("reason", "")
strategy   = final.get("strategy", [])

# ── VERDICT BANNER ────────────────────────────────────────────────────────────
st.markdown("---")
badge = {"GO": "🟢", "CONDITIONAL GO": "🟡", "NO-GO": "🔴"}.get(verdict, "⚪")
st.markdown(f"## {badge} Verdict: **{verdict}** — Confidence: **{confidence}%**")
if reason:
    st.info(f"💬 {reason}")
st.markdown("---")

# ── KPI CARDS ─────────────────────────────────────────────────────────────────
st.subheader("📊 Key Metrics")
k1, k2, k3, k4 = st.columns(4)
k1.metric("Market Size",    research.get("market_size", "N/A"))
k2.metric("Growth Rate",    research.get("growth_rate", "N/A"))
k3.metric("Success Chance", f"{simulation.get('success_probability', '?')}%")
k4.metric("Risk Level",     simulation.get("risk_level", "N/A"))
st.markdown("---")

# ── AI DEBATE ────────────────────────────────────────────────────────────────
st.subheader("🧠 AI Debate: Analyst vs Critic")
left, right = st.columns(2)
with left:
    st.markdown("### 🟢 Analyst View")
    for item in insights.get("insights", []):
        st.success(item)
    for o in insights.get("opportunities", []):
        st.success(f"💡 {o}")
with right:
    st.markdown("### 🔴 Critic View")
    for r in risks.get("risks", []):
        st.error(r)
    flaw = risks.get("fatal_flaw", "")
    if flaw:
        st.markdown("**☠️ Fatal Flaw:**")
        st.error(flaw)
st.markdown("---")

# ── RISK GAUGE + SIMULATION ───────────────────────────────────────────────────
risk_score = 100 - confidence
fig_gauge = go.Figure(go.Indicator(
    mode="gauge+number",
    value=risk_score,
    title={"text": "⚠️ Risk Level"},
    gauge={
        "axis": {"range": [0, 100]},
        "bar": {"color": "#ef4444"},
        "steps": [
            {"range": [0,  40], "color": "#22c55e"},
            {"range": [40, 70], "color": "#eab308"},
            {"range": [70, 100], "color": "#ef4444"},
        ],
    }
))
fig_gauge.update_layout(height=280, margin=dict(t=40, b=10))

g1, g2 = st.columns(2)
with g1:
    st.plotly_chart(fig_gauge, use_container_width=True)
with g2:
    st.subheader("🔄 Simulation")
    prob = simulation.get("success_probability", 0)
    st.metric("Success Probability", f"{prob}%")
    st.progress(min(int(prob), 100))
    st.metric("Adoption Rate", simulation.get("adoption_rate", "N/A"))
    for r in simulation.get("reasoning", []):
        st.markdown(f"- {r}")
    if simulation.get("optimized_pricing"):
        st.markdown(f"💡 **Better Pricing:** {simulation['optimized_pricing']}")
    if simulation.get("optimized_strategy"):
        st.markdown(f"🎯 **Better Strategy:** {simulation['optimized_strategy']}")
st.markdown("---")

# ── COMPETITOR CHARTS ─────────────────────────────────────────────────────────
competitors = research.get("competitors", [])
if competitors:
    try:
        comp_df = pd.DataFrame(competitors)
        ch1, ch2 = st.columns(2)
        with ch1:
            if "name" in comp_df.columns and "strength" in comp_df.columns:
                st.subheader("🏆 Competitor Strength")
                st.bar_chart(comp_df.set_index("name")["strength"])
        with ch2:
            st.subheader("🌐 Competitor Network")
            G = nx.Graph()
            names = [c.get("name", f"C{i}") for i, c in enumerate(competitors)]
            my_node = "YOUR STARTUP"
            G.add_node(my_node)
            for name in names:
                G.add_node(name)
                G.add_edge(my_node, name)
            for i in range(len(names)):
                for j in range(i + 1, len(names)):
                    G.add_edge(names[i], names[j])
            node_colors = ["#6366f1" if n == my_node else "#94a3b8" for n in G.nodes()]
            fig_net, ax = plt.subplots(figsize=(5, 3.5))
            fig_net.patch.set_facecolor("#0e1117")
            ax.set_facecolor("#0e1117")
            nx.draw(G, with_labels=True, node_color=node_colors,
                    node_size=1200, font_size=8, font_color="white",
                    edge_color="#475569", ax=ax)
            st.pyplot(fig_net)
            plt.close(fig_net)
    except Exception:
        pass

# ── PAIN POINTS ───────────────────────────────────────────────────────────────
pain_points = research.get("pain_points", [])
if pain_points:
    st.markdown("---")
    st.subheader("😤 Customer Pain Points")
    st.table(pd.DataFrame({"Pain Points": pain_points}))

# ── STRATEGY ─────────────────────────────────────────────────────────────────
if strategy:
    st.markdown("---")
    st.subheader("🎯 Go-to-Market Strategy")
    for i, step in enumerate(strategy, 1):
        st.success(f"**Step {i}:** {step}")

# ── PRICING SIMULATOR ─────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("💰 Strategy Simulator")
st.caption("Adjust pricing and simulate how it changes outcomes — without losing your main results.")

sim_price = st.slider("Adjust Pricing (₹/month)", 50, 2000, 500, step=50,
                      key="sim_price_slider")

if st.button("🔄 Simulate at This Price", key="sim_btn"):
    with st.spinner("Simulating…"):
        try:
            sim_resp = requests.post(
                "http://127.0.0.1:8000/analyze",
                json={
                    "idea": st.session_state.idea,
                    "country": st.session_state.country,
                    "audience": st.session_state.audience,
                    "pricing": f"₹{sim_price}/month",
                },
                timeout=240,
            )
            sim_data = sim_resp.json()
            if "error" not in sim_data:
                st.session_state.sim_result = sim_data
            else:
                st.error(sim_data["error"])
        except Exception as e:
            st.error(f"Simulation failed: {e}")

# Show simulation result (persisted in session_state)
if st.session_state.sim_result:
    s = st.session_state.sim_result
    sf = s.get("final", {})
    ss = s.get("simulation", {})
    sc1, sc2, sc3 = st.columns(3)
    sc1.metric("Decision",     sf.get("decision", "N/A"))
    sc2.metric("Confidence",   f"{sf.get('confidence', 0)}%")
    sc3.metric("Success Prob", f"{ss.get('success_probability', 0)}%")
    st.info(sf.get("reason", ""))

# ── JSON REPORT ───────────────────────────────────────────────────────────────
st.markdown("---")
with st.expander("📄 Full JSON Report"):
    st.json(data)