import type { ReactNode } from "react";

interface ReportTabProps {
  result: Record<string, unknown>;
}

type Pain = {
  problem?: string;
  opportunity?: string;
  severity?: string;
  text?: string;
};

function ConfidenceBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) return null;

  const color =
    score >= 80 ? "#22c55e" : score >= 65 ? "#eab308" : "#ef4444";

  return (
    <span
      className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold"
      style={{
        background: color + "20",
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {score}%
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="mb-6 rounded-xl p-5"
      style={{
        background: "#0f1219",
        border: "1px solid #1e2535",
      }}
    >
      <h3
        className="font-bold mb-4"
        style={{ color: "#e2e8f0" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ReportTab({ result }: ReportTabProps) {
  const {
    market,
    competitors,
    pain_points,
    timing,
    red_team,
    validation,
    report,
  } = result as Record<string, any>;

  const m = market ?? {};
  const t = timing ?? {};
  const rt = red_team ?? {};
  const r = report ?? {};
  const v = validation ?? {};

  const comps = Array.isArray(competitors?.competitors)
    ? competitors.competitors
    : [];

  // 🔥 FIXED PAIN POINT NORMALIZATION
  let pains: Pain[] = [];

  if (Array.isArray(pain_points)) {
    pains = pain_points;
  } else if (
    typeof pain_points === "object" &&
    Array.isArray(pain_points?.pain_points)
  ) {
    pains = pain_points.pain_points;
  }

  const kills = Array.isArray(rt.kill_reasons)
    ? rt.kill_reasons
    : [];

  const signals = Array.isArray(t.signals)
    ? t.signals
    : [];

  const strategy = Array.isArray(r.strategy)
    ? r.strategy
    : [];

  const verdictColorMap: Record<string, string> = {
    GO: "#22c55e",
    "CONDITIONAL GO": "#eab308",
    "NO-GO": "#ef4444",
  };
  const verdictColor = verdictColorMap[String(r.verdict ?? "")] ?? "#030304ff";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Verdict */}
      <div
        className="rounded-xl p-5 text-center mb-6"
        style={{
          background: "#0f1421",
          border: `1px solid ${verdictColor}44`,
        }}
      >
        <div
          className="text-3xl font-black mb-1"
          style={{ color: verdictColor }}
        >
          {String(r.verdict ?? "")}
        </div>
        <p
          className="text-sm"
          style={{ color: "#94a3b8" }}
        >
          {String(r.verdict_reason ?? "")}
        </p>
        {!!r.executive_summary && (
          <p
            className="text-sm mt-2"
            style={{ color: "#64748b" }}
          >
            {String(r.executive_summary)}
          </p>
        )}
      </div>

      {/* Market */}
      <Section
        title={
          <>
            📊 Market Overview{" "}
            <ConfidenceBadge
              score={Number(v.market_confidence) || undefined}
            />
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["TAM", m.tam],
            ["SAM", m.sam],
            ["SOM", m.som],
            ["CAGR", m.cagr],
          ].map(([k, val]) => (
            <div
              key={String(k)}
              className="p-3 rounded-lg"
              style={{ background: "#161b27" }}
            >
              <div
                className="text-xs"
                style={{ color: "#64748b" }}
              >
                {k}
              </div>
              <div
                className="font-bold text-sm"
                style={{ color: "#e2e8f0" }}
              >
                {String(val || "—")}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Pain Points */}
      <Section
        title={
          <>
            Customer Pain Points{" "}
            <ConfidenceBadge
              score={
                Number(v.pain_point_confidence) || undefined
              }
            />
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {pains.length === 0 ? (
            <div className="text-xs text-gray-500">
              No pain points available
            </div>
          ) : (
            pains.map((p, i) => {
              const severity = p.severity || "Moderate";
              const problem =
                p.problem || p.text || "Unknown issue";
              const opportunity =
                p.opportunity || "";

              return (
                <div
                  key={i}
                  className="flex gap-3 items-start p-3 rounded-lg"
                  style={{ background: "#161b27" }}
                >
                  <span
                    className="text-xs px-2 py-1 rounded font-bold flex-shrink-0"
                    style={{
                      background:
                        severity === "Critical"
                          ? "#2d0a0a"
                          : "#1c1a05",
                      color:
                        severity === "Critical"
                          ? "#ef4444"
                          : "#eab308",
                    }}
                  >
                    {severity}
                  </span>

                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      {problem}
                    </div>
                    {opportunity && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: "#64748b" }}
                      >
                        {opportunity}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Section>
    </div>
  );
}