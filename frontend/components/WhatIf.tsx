"use client";
import { useState } from "react";

const REGIONS = ["India", "US", "Global", "EU", "SEA"];

function MarketResultView({ data }: { data: any }) {
  const metrics = [
    { label: "TAM", value: data.tam },
    { label: "SAM", value: data.sam },
    { label: "SOM", value: data.som },
    { label: "CAGR", value: data.cagr },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {metrics.map(m => (
          <div key={m.label} className="p-3 rounded-lg" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>{m.label}</div>
            <div className="text-sm font-bold" style={{ color: "#e2e8f0" }}>{m.value || "—"}</div>
          </div>
        ))}
      </div>
      {data.market_stage && (
        <div className="text-xs mb-2" style={{ color: "#94a3b8" }}>
          <span className="font-semibold" style={{ color: "#6366f1" }}>Market Stage:</span> {data.market_stage}
        </div>
      )}
      {data.five_year_projection && (
        <div className="text-xs" style={{ color: "#94a3b8" }}>
          <span className="font-semibold" style={{ color: "#6366f1" }}>5-Year Projection:</span> {data.five_year_projection}
        </div>
      )}
      {data.sources && data.sources.length > 0 && (
        <div className="mt-3 pt-2 border-t border-[#1e2535]">
          <div className="text-[9px] uppercase tracking-widest text-[#64748b] mb-1">Sources</div>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((s: string, i: number) => (
              <span key={i} className="text-[10px] text-[#6366f1] hover:underline cursor-pointer">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitorResultView({ data }: { data: any }) {
  const comps = data.competitors || [];
  return (
    <div className="flex flex-col gap-3">
      {comps.map((c: any, i: number) => (
        <div key={i} className="p-3 rounded-lg" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
          <div className="flex justify-between items-start mb-2">
            <div className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{c.name}</div>
            <div className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#1e2535", color: "#6366f1", border: "1px solid #6366f133" }}>{c.market_share} Share</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div style={{ color: "#94a3b8" }}><span className="text-[#64748b]">Funding:</span> {c.funding}</div>
            <div style={{ color: "#94a3b8" }}><span className="text-[#64748b]">Pricing:</span> {c.pricing}</div>
          </div>
          <div className="mt-2 text-xs p-2 rounded" style={{ background: "#0f1219", border: "1px solid #ef444422", color: "#ef4444" }}>
            <span className="font-bold mr-1">Weakness:</span> {c.weakness}
          </div>
        </div>
      ))}
      {data.sources && data.sources.length > 0 && (
        <div className="mt-1 pt-2 border-t border-[#1e2535]">
          <div className="text-[9px] uppercase tracking-widest text-[#64748b] mb-1">Sources</div>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((s: string, i: number) => (
              <span key={i} className="text-[10px] text-[#6366f1] hover:underline cursor-pointer">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PainPointResultView({ data }: { data: any }) {
  const pains = data.pain_points || [];
  return (
    <div className="flex flex-col gap-3">
      {pains.map((p: any, i: number) => (
        <div key={i} className="p-3 rounded-lg" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
          <div className="flex gap-2 items-center mb-2">
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded" 
              style={{ background: p.severity === "Critical" ? "#ef4444" : "#eab308", color: "#000" }}>
              {p.severity.toUpperCase()}
            </span>
            <div className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{p.problem}</div>
          </div>
          <div className="text-xs mb-2" style={{ color: "#94a3b8" }}>
            <span className="text-[#64748b]">Solution Flaw:</span> {p.current_solution}
          </div>
          <div className="text-xs p-2 rounded" style={{ background: "#062016", color: "#22c55e", border: "1px solid #22c55e22" }}>
            <span className="font-bold mr-1">Opportunity:</span> {p.opportunity}
          </div>
        </div>
      ))}
      {data.sources && data.sources.length > 0 && (
        <div className="mt-1 pt-2 border-t border-[#1e2535]">
          <div className="text-[9px] uppercase tracking-widest text-[#64748b] mb-1">Sources</div>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((s: string, i: number) => (
              <span key={i} className="text-[10px] text-[#6366f1] hover:underline cursor-pointer">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatIf({ idea, region, segment }: { idea: string; region: string; segment: string }) {
  const [sel, setSel] = useState(region);
  const [pricing, setPricing] = useState("Freemium");
  const [seg, setSeg] = useState(segment);
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>>({});

  async function runAgent(agent: string) {
    setLoading(agent);
    try {
      const res = await fetch("http://localhost:8000/api/whatif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, region: sel, segment: seg, pricing, agent }),
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [agent]: data }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>🎚️ What-If Simulator</h2>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>Change parameters and re-run individual agents without a full restart.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs block mb-1" style={{ color: "#64748b" }}>Region</label>
          <select className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
            value={sel} onChange={e => setSel(e.target.value)}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "#64748b" }}>Pricing Model</label>
          <select className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
            value={pricing} onChange={e => setPricing(e.target.value)}>
            {["Freemium", "B2B SaaS", "Marketplace", "Usage-based", "One-time"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "#64748b" }}>Segment</label>
          <input className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
            value={seg} onChange={e => setSeg(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {(["market", "competitor", "pain_point"] as const).map(a => (
          <button key={a} onClick={() => runAgent(a)}
            disabled={loading !== null}
            className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-40"
            style={{ background: "#1e2535", color: "#e2e8f0", border: "1px solid #2d3748" }}>
            {loading === a ? "Running…" : a === "market" ? "📊 Market Size" : a === "competitor" ? "🔭 Competitors" : "😤 Pain Points"}
          </button>
        ))}
      </div>

      {Object.entries(results).map(([agent, data]) => (
        <div key={agent} className="mb-4 rounded-xl p-4" style={{ background: "#0f1219", border: "1px solid #1e2535" }}>
          <div className="text-xs font-bold mb-3" style={{ color: "#6366f1" }}>{agent.toUpperCase()} RESULT</div>
          {agent === "market" && <MarketResultView data={data} />}
          {agent === "competitor" && <CompetitorResultView data={data} />}
          {agent === "pain_point" && <PainPointResultView data={data} />}
        </div>
      ))}
    </div>
  );
}
