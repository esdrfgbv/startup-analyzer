export interface AgentEvent {
  agent: string;
  status: string;
  ts: number;
}

const AGENT_LABELS: Record<string, string> = {
  orchestrator: "🎯 Orchestrator",
  market_sizer: "📊 Market Sizer",
  competitor_scout: "🔭 Competitor Scout",
  pain_point: "😤 Pain Point Detector",
  timing: "⏱️ Timing Analyst",
  red_team: "🔴 Red Team",
  validator: "✅ Validator",
  synthesizer: "🧬 Synthesizer",
  debate: "⚔️ Debate Agents",
  cache: "💾 Cache",
  connection: "🔌 Connection",
  complete: "🏁 Complete",
};

export default function AgentFeed({ events }: { events: AgentEvent[] }) {
  return (
    <div className="flex flex-col gap-2">
      {events.length === 0 && (
        <p className="text-xs" style={{ color: "#475569" }}>Waiting for agents to start…</p>
      )}
      {events.map((ev) => (
        <div key={ev.agent} className="flex items-start gap-2 text-xs rounded-lg px-3 py-2"
          style={{ background: "#161b27", border: "1px solid #1e2535" }}>
          <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${ev.status === "running" ? "animate-pulse" : ""}`}
            style={{ background: ev.status === "done" || ev.status.includes("hit") ? "#22c55e" : ev.status === "running" ? "#eab308" : ev.status.includes("error") ? "#ef4444" : "#2563eb" }} />
          <div>
            <div style={{ color: "#e2e8f0" }}>{AGENT_LABELS[ev.agent] ?? ev.agent}</div>
            <div style={{ color: "#64748b" }}>{ev.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
