"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AgentFeed, { AgentEvent } from "@/components/AgentFeed";
import ReportTab from "@/components/ReportTab";
import WarRoomTab from "@/components/WarRoomTab";
import MarketRadarTab from "@/components/MarketRadarTab";
import GTMCanvas from "@/components/GTMCanvas";
import SharkTank from "@/components/SharkTank";
import WhatIf from "@/components/WhatIf";

const TABS = ["Report", "War Room", "Market Radar", "GTM Canvas", "Shark Tank", "What-If"];

export default function Dashboard() {
  const params = useSearchParams();
  const idea    = params.get("idea") || "";
  const region  = params.get("region") || "";
  const segment = params.get("segment") || "";

  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!idea) return;
    const url = `http://localhost:8000/api/stream?idea=${encodeURIComponent(idea)}&region=${encodeURIComponent(region)}&segment=${encodeURIComponent(segment)}`;
    const es = new EventSource(url);
    esRef.current = es;

    const agentOrder = ["orchestrator","market_sizer","competitor_scout","pain_point","timing","red_team","validator","synthesizer","debate"];
    let doneCount = 0;

    es.onmessage = (e) => {
      const parsed = JSON.parse(e.data);
      const { agent, status, data } = parsed;

      setEvents(prev => {
        const idx = prev.findIndex(ev => ev.agent === agent);
        const entry: AgentEvent = { agent, status, ts: Date.now() };
        if (idx >= 0) { const n = [...prev]; n[idx] = entry; return n; }
        return [...prev, entry];
      });

      if (status === "done") {
        doneCount++;
        setProgress(Math.round((doneCount / agentOrder.length) * 100));
      }

      if (agent === "complete" && data) {
        setResult(data as Record<string, unknown>);
        setProgress(100);
        const val = (data as Record<string, unknown>).validation as Record<string, unknown>;
        if (val?.overall_confidence) setConfidence(val.overall_confidence as number);
        es.close();
      }

      if (agent === "cache" && status === "hit" && data) {
        setResult(data as Record<string, unknown>);
        setProgress(100);
        setEvents([{ agent: "cache", status: "hit (cached result)", ts: Date.now() }]);
        const val = (data as Record<string, unknown>).validation as Record<string, unknown>;
        if (val?.overall_confidence) setConfidence(val.overall_confidence as number);
        es.close();
      }
    };

    es.onerror = () => {
      setEvents(prev => [...prev, { agent: "connection", status: "error — backend may be down", ts: Date.now() }]);
      es.close();
    };

    return () => es.close();
  }, [idea, region, segment]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07090f" }}>

      {/* LEFT SIDEBAR — Agent Feed */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r overflow-hidden" style={{ borderColor: "#1e2535", background: "#0f1219" }}>
        <div className="p-4 border-b" style={{ borderColor: "#1e2535" }}>
          <div className="font-bold text-sm mb-1" style={{ color: "#6366f1" }}>⚡ StratosAI War Room</div>
          <div className="text-xs mb-3" style={{ color: "#64748b" }}>{idea}</div>
          {/* Progress bar */}
          <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "#1e2535" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
          </div>
          <div className="text-xs mt-1" style={{ color: "#475569" }}>{progress}% complete</div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AgentFeed events={events} />
        </div>
        {confidence !== null && (
          <div className="p-4 border-t" style={{ borderColor: "#1e2535" }}>
            <div className="text-xs mb-1" style={{ color: "#64748b" }}>Overall Confidence</div>
            <div className="text-2xl font-black" style={{ color: confidence >= 80 ? "#22c55e" : confidence >= 65 ? "#eab308" : "#ef4444" }}>
              {confidence}%
            </div>
          </div>
        )}
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <nav className="flex border-b flex-shrink-0" style={{ borderColor: "#1e2535", background: "#0f1219" }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className="px-5 py-3 text-sm font-medium transition-all border-b-2"
              style={{
                borderColor: activeTab === i ? "#6366f1" : "transparent",
                color: activeTab === i ? "#6366f1" : "#64748b",
              }}>
              {tab}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result && progress < 100 && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#6366f1", borderTopColor: "transparent" }} />
              <p style={{ color: "#64748b" }}>Agents are working… watch the feed</p>
            </div>
          )}
          {result && (
            <>
              {activeTab === 0 && <ReportTab result={result} />}
              {activeTab === 1 && <WarRoomTab debate={result.debate as {role:string;message:string}[]} />}
              {activeTab === 2 && <MarketRadarTab competitors={(result.competitors as {competitors: unknown[]}).competitors} />}
              {activeTab === 3 && <GTMCanvas report={result.report as Record<string, unknown>} />}
              {activeTab === 4 && <SharkTank idea={idea} region={region} segment={segment} />}
              {activeTab === 5 && <WhatIf idea={idea} region={region} segment={segment} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
