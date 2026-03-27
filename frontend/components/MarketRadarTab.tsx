"use client";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell, LabelList } from "recharts";

interface Competitor {
  name: string;
  price_score: number;
  feature_score: number;
  pricing?: string;
  weakness?: string;
}

const COMPETITOR_COLORS = ["#2563eb", "#f43f5e", "#fbbf24", "#06b6d4", "#1d4ed8", "#ec4899", "#10b981", "#f97316"];

export default function MarketRadarTab({ competitors }: { competitors: unknown[] }) {
  const comps = (competitors ?? []) as Competitor[];
  const data = comps.map(c => ({ name: c.name, x: c.price_score, y: c.feature_score, pricing: c.pricing }));

  // Find white space (midpoint of gaps)
  const avgX = data.reduce((s, d) => s + d.x, 0) / (data.length || 1);
  const avgY = data.reduce((s, d) => s + d.y, 0) / (data.length || 1);
  const opportunityX = avgX > 5 ? Math.max(1, avgX - 3) : Math.min(9, avgX + 3);
  const opportunityY = avgY > 5 ? Math.max(1, avgY - 2) : Math.min(9, avgY + 2);
  const opportunity = [{ name: "YOUR OPPORTUNITY", x: opportunityX, y: opportunityY }];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>🎯 Market Radar — Competitor Positioning</h2>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>X: Price Score (1=cheap, 10=premium) · Y: Feature Richness (1=simple, 10=full-featured)</p>

      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
            <XAxis type="number" dataKey="x" domain={[0, 10]} stroke="#475569">
              <Label value="Price Score →" position="insideBottom" offset={-10} fill="#64748b" fontSize={11} />
            </XAxis>
            <YAxis type="number" dataKey="y" domain={[0, 10]} stroke="#475569">
              <Label value="Feature Richness →" angle={-90} position="insideLeft" fill="#64748b" fontSize={11} />
            </YAxis>
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg p-3 text-xs" style={{ background: "#161b27", border: "1px solid #1e2535" }}>
                    <div className="font-bold mb-1" style={{ color: "#e2e8f0" }}>{d.name}</div>
                    <div style={{ color: "#64748b" }}>Price: {d.x} · Features: {d.y}</div>
                    {d.pricing && <div style={{ color: "#94a3b8" }}>{d.pricing}</div>}
                  </div>
                );
              }}
            />
            <Scatter name="Competitors" data={data} r={8}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COMPETITOR_COLORS[index % COMPETITOR_COLORS.length]} />
              ))}
              <LabelList dataKey="name" position="bottom" offset={10} fill="#94a3b8" fontSize={9} />
            </Scatter>
            <Scatter name="Opportunity" data={opportunity} fill="#22c55e" r={14}
              shape={(props: { cx?: number; cy?: number }) => {
                const cx = props.cx ?? 0;
                const cy = props.cy ?? 0;
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={20} fill="#22c55e" fillOpacity={0.15} />
                    <circle cx={cx} cy={cy} r={10} fill="#22c55e" fillOpacity={0.4} />
                    <circle cx={cx} cy={cy} r={5} fill="#22c55e" />
                    <text x={cx} y={cy - 18} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight="bold">YOUR SPOT</text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {comps.map((c, i) => (
          <div key={c.name} className="rounded-xl p-4 text-xs" style={{ background: "#0f1219", border: "1px solid #1e2535" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: COMPETITOR_COLORS[i % COMPETITOR_COLORS.length] }} />
              <div className="font-bold" style={{ color: "#e2e8f0" }}>{c.name}</div>
            </div>
            {c.pricing && <div style={{ color: "#94a3b8" }}>💰 {c.pricing}</div>}
            {c.weakness && <div className="mt-1" style={{ color: "#ef4444" }}>⚠️ {c.weakness}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
