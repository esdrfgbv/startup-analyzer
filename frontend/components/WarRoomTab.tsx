interface WarRoomTabProps {
  debate: { role: string; message: string }[];
}

const ROLE_STYLE: Record<string, { label: string; bg: string; border: string; color: string }> = {
  bull: { label: "🟢 BULL", bg: "#052e16", border: "#166534", color: "#22c55e" },
  bear: { label: "🔴 BEAR", bg: "#2d0a0a", border: "#991b1b", color: "#ef4444" },
  realist: { label: "🟡 REALIST", bg: "#1c1a05", border: "#854d0e", color: "#eab308" },
};

export default function WarRoomTab({ debate }: WarRoomTabProps) {
  if (!debate || debate.length === 0) {
    return <p style={{ color: "#64748b" }}>Debate not yet generated.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>⚔️ AI War Room — The Debate</h2>
      <p className="text-sm mb-6" style={{ color: "#64748b" }}>Three AI agents with different perspectives debate your startup idea.</p>
      <div className="flex flex-col gap-4">
        {debate.map((turn, i) => {
          const s = ROLE_STYLE[turn.role] ?? ROLE_STYLE.realist;
          return (
            <div key={i} className="rounded-xl p-5" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="text-xs font-bold mb-2" style={{ color: s.color }}>{s.label}</div>
              <p className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>{turn.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
