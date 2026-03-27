interface GTMCanvasProps {
  report: {
    gtm?: Record<string, string>;
    market_entry_suggestion?: string;
    [key: string]: any;
  };
}

const BOXES = [
  { key: "beachhead", label: "🎯 Beachhead Market", desc: "Who you target first" },
  { key: "channel", label: "📢 Distribution Channel", desc: "How you reach them" },
  { key: "pricing", label: "💰 Pricing Strategy", desc: "Model & price point" },
  { key: "first_100", label: "🚀 First 100 Customers", desc: "Your acquisition playbook" },
  { key: "month1_metric", label: "📈 Month 1 Metric", desc: "Single KPI to track" },
  { key: "biggest_risk", label: "⚠️ Biggest Risk", desc: "Risk to monitor daily" },
];

export default function GTMCanvas({ report }: GTMCanvasProps) {
  if (!report) return <p style={{ color: "#64748b" }}>Report not yet ready.</p>;
  const gtm = report.gtm ?? {};

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>🗺️ Go-To-Market Canvas</h2>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>Your complete market entry strategy in 6 boxes.</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {BOXES.map((box) => (
          <div key={box.key} className="rounded-xl p-5 flex flex-col gap-2"
            style={{ background: "#0f1219", border: "1px solid #1e2535", minHeight: 140 }}>
            <div className="text-xs font-bold" style={{ color: "#2563eb" }}>{box.label}</div>
            <div className="text-xs" style={{ color: "#475569" }}>{box.desc}</div>
            <div className="text-sm mt-auto leading-relaxed" style={{ color: "#e2e8f0" }}>
              {String(gtm[box.key] || report[box.key] || "—")}
            </div>
          </div>
        ))}
      </div>
      {!!report.market_entry_suggestion && (
        <div className="mt-6 rounded-xl p-5" style={{ background: "#0f1421", border: "1px solid #312e81" }}>
          <div className="text-xs font-bold mb-2" style={{ color: "#818cf8" }}>📋 Market Entry Recommendation</div>
          <p className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>{report.market_entry_suggestion}</p>
        </div>
      )}
    </div>
  );
}
