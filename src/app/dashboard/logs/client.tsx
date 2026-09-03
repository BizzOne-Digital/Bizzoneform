"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

type LogEntry = {
  id: string; created_at: string; status: "success" | "failed";
  reason: string; name: string; business: string; email: string; phone: string;
};

function fmt(d: string) {
  return new Date(d).toLocaleString("en-CA", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LogsUI() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/logs");
    if (res.ok) setLogs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l => filter === "all" || l.status === filter);
  const failedCount = logs.filter(l => l.status === "failed").length;

  return (
    <div className="min-h-screen bg-[#05060A]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/6 bg-[#05060A]/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-white">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="text-sm font-bold text-white">Form Submission Logs</div>
            <div className="text-[10px] text-white/40">Every attempt to submit the onboarding form</div>
          </div>
        </div>
        <button onClick={load} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-white">
          <RefreshCw size={14} />
        </button>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-2xl font-extrabold text-white">{logs.length}</div>
            <div className="text-xs text-white/45 mt-0.5">Total attempts</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-2xl font-extrabold text-green-400">{logs.length - failedCount}</div>
            <div className="text-xs text-white/45 mt-0.5">Successful</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-2xl font-extrabold text-red-400">{failedCount}</div>
            <div className="text-xs text-white/45 mt-0.5">Failed / couldn&apos;t submit</div>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {(["all", "failed", "success"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${filter === f ? "bg-white/10 text-white" : "text-white/45 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-white/30">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-white/40">No logs yet</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6">
                    {["Time", "Name", "Business", "Status", "Reason"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/35">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id} className="border-b border-white/4 last:border-0">
                      <td className="px-4 py-3 text-xs text-white/45 whitespace-nowrap">{fmt(l.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="text-white/85">{l.name}</div>
                        <div className="text-xs text-white/40">{l.email}{l.phone && l.phone !== "—" ? ` · ${l.phone}` : ""}</div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{l.business}</td>
                      <td className="px-4 py-3">
                        {l.status === "success" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-green-400">
                            <CheckCircle2 size={11} /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold uppercase text-red-400">
                            <XCircle size={11} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/60 max-w-xs">{l.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
