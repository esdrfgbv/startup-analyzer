import type { ReactNode } from "react";

interface ReportTabProps { result: Record<string, unknown>; }

function ConfidenceBadge({ score }: { score?: number }) {
  if (!score) return null;
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#eab308" : "#ef4444";
  return (
    <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: color + "20", color, border: `1px solid ${color}40` }}>
      {score}%
    </span>
  );
}

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-6 rounded-xl p-5" style={{ background: "#0f1219", border: "1px solid #1e2535" }}>
      <h3 className="font-bold mb-4" style={{ color: "#e2e8f0" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function ReportTab({ result }: ReportTabProps) {
  const { market, competitors, pain_points, timing, red_team, validation, report } = result as Record<string, Record<string, unknown>>;
  const m = (market ?? {}) as Record<string, string | number>;
  const t = (timing ?? {}) as Record<string, unknown>;
  const rt = (red_team ?? {}) as Record<string, unknown>;
  const r = (report ?? {}) as Record<string, unknown>;
  const v = (validation ?? {}) as Record<string, number>;
  const comps = ((competitors as Record<string, any>)?.competitors ?? []) as any[];
  const pains = ((pain_points as Record<string, any>)?.pain_points ?? []) as any[];
  const kills = (rt.kill_reasons ?? []) as any[];
  const signals = (t.signals ?? []) as any[];
  const strategy = (r.strategy ?? []) as string[];

  const verdictColor = { GO: "#22c55e", "CONDITIONAL GO": "#eab308", "NO-GO": "#ef4444" }[r.verdict as string] ?? "#2563eb";

  return (
    <div className="max-w-4xl mx-auto">

      {/* Verdict */}
      <div className="rounded-xl p-5 text-center mb-6" style={{ background: "#0f1421", border: `1px solid ${verdictColor}44` }}>
        <div className="text-3xl font-black mb-1" style={{ color: verdictColor }}>{String(r.verdict ?? "")}</div>
        <p className="text-sm" style={{ color: "#94a3b8" }}>{r.verdict_reason as string}</p>
        {!!r.executive_summary && <p className="text-sm mt-2" style={{ color: "#64748b" }}>{r.executive_summary as string}</p>}
      </div>

      {/* Market Overview */}
      <Section title={<>📊 Market Overview <ConfidenceBadge score={v.market_confidence as number} /></>}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["TAM", m.tam], ["SAM", m.sam], ["SOM", m.som], ["CAGR", m.cagr]].map(([k, v]) => (
            <div key={k as string} className="p-3 rounded-lg" style={{ background: "#161b27" }}>
              <div className="text-xs" style={{ color: "#64748b" }}>{k}</div>
              <div className="font-bold text-sm" style={{ color: "#e2e8f0" }}>{v as string || "—"}</div>
            </div>
          ))}
        </div>
        {m.five_year_projection && <p className="text-xs mt-3" style={{ color: "#64748b" }}>5-year projection: {String(m.five_year_projection)}</p>}
      </Section>

      {/* Competitors */}
      <Section title={<>🔭 Competitor Landscape <ConfidenceBadge score={v.competitor_confidence as number} /></>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#64748b" }}>
                {["Name", "Funding", "Pricing", "Weakness"].map(h => <th key={h} className="text-left py-2 pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {comps.map((c, i) => (
                <tr key={i} style={{ borderTop: "1px solid #1e2535", color: "#e2e8f0" }}>
                  <td className="py-2 pr-4 font-semibold">{c.name}</td>
                  <td className="py-2 pr-4" style={{ color: "#94a3b8" }}>{c.funding}</td>
                  <td className="py-2 pr-4" style={{ color: "#94a3b8" }}>{c.pricing}</td>
                  <td className="py-2" style={{ color: "#ef4444" }}>{c.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Pain Points */}
      <Section title={<>Customer Pain Points <ConfidenceBadge score={v.pain_point_confidence as number} /></>}>
        <div className="flex flex-col gap-2">
          {pains.map((p, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: "#161b27" }}>
              <span className="text-xs px-2 py-1 rounded font-bold flex-shrink-0"
                style={{ background: String(p.severity) === "Critical" ? "#2d0a0a" : "#1c1a05", color: String(p.severity) === "Critical" ? "#ef4444" : "#eab308" }}>
                {String(p.severity || "")}
              </span>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{String(p.problem || "")}</div>
                <div className="text-xs mt-1" style={{ color: "#64748b" }}>{String(p.opportunity || "")}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Timing */}
      <Section title={<>⏱️ Market Timing <ConfidenceBadge score={v.timing_confidence as number} /></>}>
        <div className="flex gap-4 mb-3">
          <div className="text-lg font-black" style={{ color: t.timing_verdict === "Right Time" ? "#22c55e" : "#eab308" }}>
            {String(t.timing_verdict ?? "")}
          </div>
          {t.timing_score !== undefined && <span className="text-sm" style={{ color: "#64748b" }}>Score: {String(t.timing_score)}/100</span>}
        </div>
        <div className="flex flex-col gap-2">
          {signals.map((s, i) => (
            <div key={i} className="text-xs flex gap-2" style={{ color: "#94a3b8" }}>
              <span>{s.type === "positive" ? "🟢" : s.type === "negative" ? "🔴" : "🟡"}</span>
              <span>{s.signal}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Red Team */}
      <Section title="🔴 Red Team Findings">
        {!!rt.fatal_flaw && (
          <div className="mb-3 p-3 rounded-lg text-sm" style={{ background: "#2d0a0a", color: "#ef4444", border: "1px solid #991b1b" }}>
            ☠️ Fatal Flaw: {String(rt.fatal_flaw)}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {kills.map((k, i) => (
            <div key={i} className="p-3 rounded-lg" style={{ background: "#161b27" }}>
              <div className="flex gap-2 items-center mb-1">
                <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: "#2d0a0a", color: "#ef4444" }}>{k.severity}</span>
                <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>{k.category}</span>
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{k.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Strategy */}
      {strategy.length > 0 && (
        <Section title="🎯 Recommended Strategy">
          <div className="flex flex-col gap-2">
            {strategy.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "#052e16", border: "1px solid #166534" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "#22c55e", color: "#052e16" }}>{i + 1}</span>
                <p className="text-sm" style={{ color: "#e2e8f0" }}>{s}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* References */}
      {r.all_sources && (Array.isArray(r.all_sources)) && r.all_sources.length > 0 && (
        <Section title="📑 References & Sources">
          <div className="flex flex-wrap gap-2">
            {r.all_sources.map((s: string, i: number) => (
              <div key={i} className="px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "#161b27", border: "1px solid #1e2535", color: "#2563eb" }}>
                {s}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
