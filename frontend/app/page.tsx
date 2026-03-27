"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const REGIONS = ["India", "US", "Global", "EU", "SEA"];

export default function Home() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [region, setRegion] = useState("India");
  const [segment, setSegment] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea || !segment) return;
    setLoading(true);
    const params = new URLSearchParams({ idea, region, segment });
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #07090f 0%, #0d1020 50%, #07090f 100%)" }}>

      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-xl text-center">
        <div className="mb-3 inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{ background: "#1e2535", color: "#2563eb", border: "1px solid #2563eb" }}>
          Multi-Agent AI System
        </div>

        <h1 className="text-5xl font-black mb-2 tracking-tight"
          style={{ background: "linear-gradient(135deg, #e2e8f0, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AgentAstra
        </h1>
        <p className="text-lg mb-1" style={{ color: "#94a3b8" }}>The Startup War Room</p>
        <p className="text-sm mb-10" style={{ color: "#475569" }}>
          5 AI agents debate, destroy, and validate your startup idea in real time
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
            placeholder="Your startup idea — be specific (e.g. AI legal contracts for freelancers)"
            value={idea}
            onChange={e => setIdea(e.target.value)}
          />
          <div className="flex gap-3">
            <select
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
              value={region}
              onChange={e => setRegion(e.target.value)}>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            <input
              className="flex-[2] px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
              placeholder="Customer segment (e.g. SMB HR teams)"
              value={segment}
              onChange={e => setSegment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !idea || !segment}
            className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all disabled:opacity-40 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white" }}>
            {loading ? "Launching War Room..." : "⚡ Launch War Room"}
          </button>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-3 text-xs" style={{ color: "#475569" }}>
          {["🔍 5 specialist agents", "🧠 Bull vs Bear debate", "📊 Market Radar"].map(f => (
            <div key={f} className="px-3 py-2 rounded-lg" style={{ background: "#0f1219", border: "1px solid #1e2535" }}>{f}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
