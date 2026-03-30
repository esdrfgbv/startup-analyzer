import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#07090f", color: "#64748b", fontFamily: "sans-serif" }}>Loading dashboard…</div>}>
      <DashboardClient />
    </Suspense>
  );
}
