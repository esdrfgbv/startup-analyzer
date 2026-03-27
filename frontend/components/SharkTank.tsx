"use client";
import { useEffect, useState } from "react";

interface Msg { role: "investor" | "founder"; content: string; }

export default function SharkTank({ idea, region, segment }: { idea: string; region: string; segment: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  async function start() {
    setStarted(true);
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/shark-tank/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, region, segment }),
    });
    const data = await res.json();
    setMsgs([{ role: "investor", content: data.question }]);
    setTurn(1);
    setLoading(false);
  }

  async function reply() {
    if (!input.trim() || loading) return;
    const answer = input.trim();
    setInput("");
    setMsgs(prev => [...prev, { role: "founder", content: answer }]);
    setLoading(true);
    const history = [...msgs, { role: "founder" as const, content: answer }].map(m => ({ role: m.role, content: m.content }));
    const res = await fetch("http://localhost:8000/api/shark-tank/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, answer, turn: turn + 1, history }),
    });
    const data = await res.json();
    setMsgs(prev => [...prev, { role: "investor", content: data.reply }]);
    setTurn(data.turn);
    if (data.final) setDone(true);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>🦈 Shark Tank Simulator</h2>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>Face a tough investor. Answer 5 questions. Get a funding verdict.</p>

      {!started ? (
        <button onClick={start} className="px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
          🎤 Enter the Tank
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-4" style={{ maxHeight: 420, overflowY: "auto" }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "founder" ? "justify-end" : "justify-start"}`}>
                <div className="rounded-xl px-4 py-3 text-sm max-w-xs" style={{
                  background: m.role === "investor" ? "#161b27" : "#312e81",
                  border: `1px solid ${m.role === "investor" ? "#1e2535" : "#4338ca"}`,
                  color: "#e2e8f0",
                }}>
                  <div className="text-xs mb-1" style={{ color: m.role === "investor" ? "#ef4444" : "#818cf8" }}>
                    {m.role === "investor" ? "🦈 Investor" : "You"}
                  </div>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#161b27", border: "1px solid #1e2535", color: "#64748b" }}>
                  Investor is thinking…
                </div>
              </div>
            )}
          </div>
          {!done && (
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "#0f1219", border: "1px solid #1e2535", color: "#e2e8f0" }}
                placeholder="Your answer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && reply()}
              />
              <button onClick={reply} disabled={loading}
                className="px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-40"
                style={{ background: "#6366f1", color: "white" }}>
                →
              </button>
            </div>
          )}
          {done && (
            <div className="mt-4 rounded-xl p-4 text-center" style={{ background: "#0f1421", border: "1px solid #6366f1" }}>
              <div style={{ color: "#818cf8" }} className="font-bold">Shark Tank session complete 🏁</div>
            </div>
          )}
          <div className="text-xs mt-2" style={{ color: "#475569" }}>Turn {Math.min(turn, 5)} / 5</div>
        </>
      )}
    </div>
  );
}
