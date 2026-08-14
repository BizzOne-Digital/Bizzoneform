"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, LogOut, RefreshCw, X, Trash2, Upload, ChevronLeft, ChevronRight, Download, Globe } from "lucide-react";
import { DashboardCredentialsSection, CredentialsViewer } from "@/components/DashboardCredentials";

type Status = "new" | "in_progress" | "done" | "on_hold";
type Sub = {
  id: string; created_at: string; business: string; name: string;
  email: string; phone: string; package: string; addons: string;
  site: string; social: string; goal: string; audience: string;
  logo: string; logo_url?: string; colors: string; style: string; inspo: string;
  pages: string; headline: string; about: string; notes: string;
  status: Status; assigned_to: string; internal_notes: string;
  services_list: string; pricing_details: string; has_pricing: string;
  contact_page: string; special_offers: string; file_details: string;
  target_month?: string; domain_connected?: boolean; domain_connected_at?: string;
};

type ViewMode = "all" | "month" | "domain_month" | "developer";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

function subMonth(s: Sub) {
  return s.target_month || s.created_at.slice(0, 7);
}

function toCSV(rows: Sub[]) {
  const headers = ["Business", "Contact Name", "Email", "Phone", "Package", "Status", "Target Month", "Domain Connected", "Submitted", "Assigned To"];
  const lines = [headers.join(",")];
  for (const s of rows) {
    const vals = [
      s.business, s.name, s.email, s.phone, s.package, LABEL[s.status],
      subMonth(s), s.domain_connected ? "Yes" : "No", fmt(s.created_at), s.assigned_to || "",
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`);
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

function downloadCSV(rows: Sub[], filename: string) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

const BADGE: Record<Status, string> = {
  new:         "bg-[#C8F31D]/15 text-[#C8F31D]",
  in_progress: "bg-blue-500/15 text-blue-400",
  done:        "bg-green-500/15 text-green-400",
  on_hold:     "bg-amber-500/15 text-amber-400",
};
const LABEL: Record<Status, string> = {
  new: "New", in_progress: "In Progress", done: "Done", on_hold: "On Hold"
};

const TEAM = ["Zubair", "Shumaila", "Preety"];

const PACKAGES = ["Standard ($79)", "Admin+ ($99)", "Premium ($149)", "Advanced ($299)"];

// Package price used to total up revenue per package tier.
const PRICE: Record<string, number> = {
  "Standard ($79)": 79,
  "Admin+ ($99)": 99,
  "Premium ($149)": 149,
  "Advanced ($299)": 299,
};

// Older submissions used different labels ("Starter") for the same tier —
// bucket by keyword/price so commission totals don't miss them.
function packageBucket(pkg: string): string {
  const p = (pkg || "").toLowerCase();
  if (p.includes("advance") || p.includes("$299")) return "Advanced ($299)";
  if (p.includes("premium") || p.includes("$149")) return "Premium ($149)";
  if (p.includes("admin+") || p.includes("$99")) return "Admin+ ($99)";
  if (p.includes("standard") || p.includes("starter") || p.includes("$79")) return "Standard ($79)";
  return pkg || "Unspecified";
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ name }: { name: string }) {
  const ini = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-black"
      style={{ background: "linear-gradient(135deg,#C8F31D,#8C00FF)" }}>{ini}</div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="border-b border-white/5 py-2 last:border-0">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-0.5 text-sm text-white/85 break-words">{value}</p>
    </div>
  );
}

export default function DashboardUI() {
  const [subs, setSubs]       = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [view, setView]       = useState<ViewMode>("all");
  const [month, setMonth]     = useState(currentMonth());
  const [selectedDev, setSelectedDev] = useState<string>(TEAM[0]);
  const [selected, setSelected] = useState<Sub | null>(null);
  const [saving, setSaving]   = useState(false);
  const [eStatus, setEStatus] = useState<Status>("new");
  const [eAssign, setEAssign] = useState("");
  const [eNotes, setENotes]   = useState("");
  const [eMonth, setEMonth]   = useState(currentMonth());
  const [eDomain, setEDomain] = useState(false);
  const [ePackage, setEPackage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [credentialsViewId, setCredentialsViewId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter !== "all") p.set("status", filter);
    if (search) p.set("search", search);
    if (view === "month" || view === "domain_month") p.set("month", month);
    if (view === "domain_month") p.set("domain_connected", "true");
    if (view === "developer") p.set("assigned_to", selectedDev);
    const res = await fetch(`/api/submissions?${p}`);
    if (res.ok) setSubs(await res.json());
    setLoading(false);
  }, [filter, search, view, month, selectedDev]);

  useEffect(() => { load(); }, [load]);

  const open = (s: Sub) => {
    setSelected(s);
    setEStatus(s.status);
    setEAssign(s.assigned_to || "");
    setENotes(s.internal_notes || "");
    setEMonth(subMonth(s));
    setEDomain(!!s.domain_connected);
    setEPackage(s.package || "");
  };

  const save = async (overrides: Partial<{ target_month: string; domain_connected: boolean }> = {}) => {
    if (!selected) return;
    setSaving(true);
    const body = {
      id: selected.id, status: eStatus, assigned_to: eAssign, internal_notes: eNotes,
      target_month: eMonth, domain_connected: eDomain, package: ePackage, ...overrides,
    };
    const res = await fetch("/api/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubs(p => p.map(s => s.id === updated.id ? updated : s));
      setSelected(updated);
      setEStatus(updated.status);
      setEMonth(subMonth(updated));
      setEDomain(!!updated.domain_connected);
      setEPackage(updated.package || "");
    }
    setSaving(false);
  };

  const shiftSelectedMonth = async (delta: number) => {
    if (!selected) return;
    const newMonth = shiftMonth(eMonth, delta);
    setEMonth(newMonth);
    setSaving(true);
    const res = await fetch("/api/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status: eStatus, assigned_to: eAssign, internal_notes: eNotes, target_month: newMonth, domain_connected: eDomain }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubs(p => p.map(s => s.id === updated.id ? updated : s));
      setSelected(updated);
    }
    setSaving(false);
  };

  const toggleDomainConnected = async (s: Sub) => {
    const res = await fetch("/api/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, status: s.status, assigned_to: s.assigned_to, internal_notes: s.internal_notes, domain_connected: !s.domain_connected }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubs(p => p.map(x => x.id === updated.id ? updated : x));
      if (selected?.id === updated.id) { setSelected(updated); setEDomain(!!updated.domain_connected); }
    }
  };

  const deleteSubmission = async () => {
    if (!selected) return;
    setDeleting(true);
    const res = await fetch("/api/submissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id }),
    });
    if (res.ok) {
      setSubs(p => p.filter(s => s.id !== selected.id));
      setSelected(null);
      setShowDeleteConfirm(false);
    }
    setDeleting(false);
  };

  const uploadLogo = async (file: File) => {
    if (!selected) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload-logo", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "Upload failed");

      const res = await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: eStatus, assigned_to: eAssign, internal_notes: eNotes, logo_url: upData.url }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSubs(p => p.map(s => s.id === updated.id ? updated : s));
        setSelected(updated);
      } else {
        throw new Error("Could not save logo");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  const removeLogo = async () => {
    if (!selected) return;
    setUploading(true);
    const res = await fetch("/api/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status: eStatus, assigned_to: eAssign, internal_notes: eNotes, logo_url: "" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubs(p => p.map(s => s.id === updated.id ? updated : s));
      setSelected(updated);
    }
    setUploading(false);
  };

  const logout = async () => {
    await fetch("/api/submissions", { method: "DELETE" });
    window.location.href = "/dashboard/login";
  };

  const counts = subs.reduce((acc, s) => {
    acc.all = (acc.all || 0) + 1;
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const FILTERS = [
    { k: "all",         l: "All" },
    { k: "new",         l: "New" },
    { k: "in_progress", l: "In Progress" },
    { k: "done",        l: "Done" },
    { k: "on_hold",     l: "On Hold" },
  ];

  const VIEWS: { k: ViewMode; l: string }[] = [
    { k: "all",          l: "All Websites" },
    { k: "month",        l: "This Month" },
    { k: "domain_month", l: "Domain Connected" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#05060A]">

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/6 bg-[#05060A]/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-black"
            style={{ background: "linear-gradient(135deg,#8C00FF,#C8F31D)" }}>B</div>
          <div>
            <div className="text-sm font-bold text-white">BizzOne Dashboard</div>
            <div className="text-[10px] text-white/40">Onboarding Submissions</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadCSV(subs, `bizzone-websites-${view}-${view === "all" ? "all" : month}.csv`)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white">
            <Download size={12} /> Generate Report
          </button>
          <button onClick={load} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-white">
            <RefreshCw size={14} />
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-white">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-white/6 p-4 lg:block">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">View</p>
          {VIEWS.map(v => (
            <button key={v.k} onClick={() => setView(v.k)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm mb-1 transition-all ${view === v.k ? "bg-white/8 text-white font-semibold" : "text-white/50 hover:text-white hover:bg-white/4"}`}>
              {v.l}
            </button>
          ))}

          {(view === "month" || view === "domain_month") && (
            <div className="mt-2 mb-4 flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2">
              <button onClick={() => setMonth(m => shiftMonth(m, -1))} className="grid h-6 w-6 place-items-center rounded-lg text-white/40 hover:text-white">
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-semibold text-white/70">{monthLabel(month)}</span>
              <button onClick={() => setMonth(m => shiftMonth(m, 1))} className="grid h-6 w-6 place-items-center rounded-lg text-white/40 hover:text-white">
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <p className="mb-3 mt-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">Status</p>
          {FILTERS.map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm mb-1 transition-all ${filter === f.k ? "bg-white/8 text-white font-semibold" : "text-white/50 hover:text-white hover:bg-white/4"}`}>
              {f.l}
              <span className="text-xs text-white/30">{counts[f.k] || 0}</span>
            </button>
          ))}

          <p className="mb-3 mt-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">Team</p>
          {TEAM.map(t => (
            <button key={t} onClick={() => { setView("developer"); setSelectedDev(t); }}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm mb-1 transition-all ${view === "developer" && selectedDev === t ? "bg-white/8 text-white font-semibold" : "text-white/50 hover:text-white hover:bg-white/4"}`}>
              {t}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: "Total",       n: counts.all || 0,         c: "text-white" },
              { l: "New",         n: counts.new || 0,         c: "text-[#C8F31D]" },
              { l: "In Progress", n: counts.in_progress || 0, c: "text-blue-400" },
              { l: "Done",        n: counts.done || 0,        c: "text-green-400" },
            ].map(s => (
              <div key={s.l} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className={`text-2xl font-extrabold ${s.c}`}>{s.n}</div>
                <div className="text-xs text-white/45 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Search + mobile filter */}
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
              <input className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-[#C8F31D]/50"
                placeholder="Search business, name, email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="rounded-xl border border-white/10 bg-[#05060A] px-3 py-2.5 text-sm text-white/70 lg:hidden"
              value={filter} onChange={e => setFilter(e.target.value)}>
              {FILTERS.map(f => <option key={f.k} value={f.k}>{f.l} ({counts[f.k] || 0})</option>)}
            </select>
          </div>

          {/* Developer commission summary */}
          {view === "developer" && !loading && (
            <div className="mb-6 space-y-3">
              <p className="text-sm font-bold text-white">{selectedDev}&apos;s Websites</p>
              {PACKAGES.map(pkg => {
                const group = subs.filter(s => packageBucket(s.package) === pkg);
                if (group.length === 0) return null;
                const connected = group.filter(s => s.domain_connected);
                const amount = connected.length * PRICE[pkg];
                return (
                  <div key={pkg} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{pkg}</p>
                      <p className="text-xs text-white/40">{group.length} site{group.length !== 1 ? "s" : ""} · {connected.length} domain connected</p>
                    </div>
                    <div className="text-lg font-extrabold text-[#C8F31D]">${amount}</div>
                  </div>
                );
              })}
              <div className="rounded-2xl border border-[#C8F31D]/30 bg-[#C8F31D]/10 p-4 flex items-center justify-between">
                <p className="text-sm font-bold text-white">Total Amount</p>
                <div className="text-xl font-extrabold text-[#C8F31D]">
                  ${PACKAGES.reduce((sum, pkg) => {
                    const connected = subs.filter(s => packageBucket(s.package) === pkg && s.domain_connected).length;
                    return sum + connected * PRICE[pkg];
                  }, 0)}
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center text-sm text-white/30">Loading...</div>
          ) : subs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm text-white/40">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/6">
                      {["Business", "Contact", "Package", "Date", "Month", "Domain", "Assigned", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/35">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(view === "developer"
                      ? [...subs].sort((a, b) => PACKAGES.indexOf(packageBucket(a.package)) - PACKAGES.indexOf(packageBucket(b.package)))
                      : subs
                    ).map(s => (
                      <tr key={s.id} className="cursor-pointer border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors" onClick={() => open(s)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.business || s.name} />
                            <span className="font-semibold text-white">{s.business || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white/80">{s.name}</div>
                          <div className="text-xs text-white/40">{s.email}</div>
                        </td>
                        <td className="px-4 py-3 text-white/60">{s.package || "—"}</td>
                        <td className="px-4 py-3 text-xs text-white/45">{fmt(s.created_at)}</td>
                        <td className="px-4 py-3 text-xs text-white/45">{monthLabel(subMonth(s))}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleDomainConnected(s)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition-colors ${s.domain_connected ? "bg-green-500/15 text-green-400" : "bg-white/8 text-white/40"}`}>
                            <Globe size={10} /> {s.domain_connected ? "Connected" : "Not Connected"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-white/60">{s.assigned_to || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${BADGE[s.status]}`}>
                            {LABEL[s.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/30">›</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Detail panel */}
        {selected && (
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/8 bg-[#08080f] shadow-2xl sm:w-[420px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-[#08080f] px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={selected.business || selected.name} />
                <div>
                  <div className="font-bold text-white">{selected.business}</div>
                  <div className="text-xs text-white/45">{selected.name}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Status panel */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/35">Project Status</p>
                <select className="w-full rounded-xl border border-white/10 bg-[#05060A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8F31D]/50"
                  value={eStatus} onChange={e => setEStatus(e.target.value as Status)}>
                  {Object.entries(LABEL).map(([v, l]) => <option key={v} value={v} style={{ background: "#05060A" }}>{l}</option>)}
                </select>
                <select className="w-full rounded-xl border border-white/10 bg-[#05060A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8F31D]/50"
                  value={eAssign} onChange={e => setEAssign(e.target.value)}>
                  <option value="" style={{ background: "#05060A" }}>Unassigned</option>
                  {TEAM.map(t => <option key={t} value={t} style={{ background: "#05060A" }}>{t}</option>)}
                </select>
                <textarea className="w-full rounded-xl border border-white/10 bg-[#05060A] min-h-[70px] resize-y px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#C8F31D]/50"
                  value={eNotes} onChange={e => setENotes(e.target.value)} placeholder="Internal notes..." />

                <div>
                  <p className="mb-1.5 text-xs text-white/40">Target Month</p>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#05060A] px-3 py-2">
                    <button onClick={() => shiftSelectedMonth(-1)} disabled={saving} className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:text-white disabled:opacity-40">
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-sm font-semibold text-white">{monthLabel(eMonth)}</span>
                    <button onClick={() => shiftSelectedMonth(1)} disabled={saving} className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:text-white disabled:opacity-40">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <button onClick={() => setEDomain(v => !v)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all ${eDomain ? "border-green-500/30 bg-green-500/15 text-green-400" : "border-white/10 bg-white/[0.02] text-white/50"}`}>
                  <Globe size={14} /> Domain {eDomain ? "Connected" : "Not Connected"}
                </button>

                <button onClick={() => save()} disabled={saving}
                  className="w-full rounded-full bg-[#C8F31D] py-2.5 text-sm font-bold text-black transition-all hover:brightness-110 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting}
                  className="w-full rounded-full bg-red-500/20 border border-red-500/30 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-60">
                  <Trash2 size={14} className="inline mr-2" />
                  Delete Form
                </button>
              </div>

              {/* Delete confirmation */}
              {showDeleteConfirm && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-300">Are you sure?</p>
                  <p className="text-xs text-red-200/80">This will permanently delete this submission and cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                      className="flex-1 rounded-full border border-white/20 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/5 disabled:opacity-60">
                      Cancel
                    </button>
                    <button onClick={deleteSubmission} disabled={deleting}
                      className="flex-1 rounded-full bg-red-500 py-2 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-60">
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">Contact</p>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-1">
                  <Row label="Email"  value={selected.email} />
                  <Row label="Phone"  value={selected.phone} />
                  <Row label="Website" value={selected.site} />
                  <Row label="Social" value={selected.social} />
                </div>
              </div>

              {/* Package */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">Package & Add-Ons</p>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
                  <div>
                    <p className="mb-1.5 text-xs text-white/40">Package</p>
                    <select className="w-full rounded-xl border border-white/10 bg-[#05060A] px-4 py-2.5 text-sm text-white outline-none focus:border-[#C8F31D]/50"
                      value={ePackage} onChange={e => setEPackage(e.target.value)}>
                      {!PACKAGES.includes(ePackage) && ePackage && (
                        <option value={ePackage} style={{ background: "#05060A" }}>{ePackage}</option>
                      )}
                      {PACKAGES.map(p => <option key={p} value={p} style={{ background: "#05060A" }}>{p}</option>)}
                    </select>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <Row label="Add-Ons"  value={selected.addons} />
                    <Row label="Submitted" value={fmt(selected.created_at)} />
                  </div>
                </div>
              </div>

              {/* Project */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">Project Details</p>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-1">
                  <Row label="Goal"            value={selected.goal} />
                  <Row label="Audience"        value={selected.audience} />
                  <Row label="Pages"           value={selected.pages} />
                  <Row label="Headline"        value={selected.headline} />
                  <Row label="About"           value={selected.about} />
                  <Row label="Services List"   value={selected.services_list} />
                  <Row label="Pricing Details" value={selected.pricing_details} />
                  <Row label="Has Pricing"     value={selected.has_pricing} />
                  <Row label="Contact Page"    value={selected.contact_page} />
                  <Row label="Special Offers"  value={selected.special_offers} />
                  <Row label="File Details"    value={selected.file_details} />
                  <Row label="Notes"           value={selected.notes} />
                </div>
              </div>

              {/* Brand */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">Brand & Design</p>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
                  <div>
                    <p className="mb-2 text-xs text-white/40">Client Logo</p>
                    {selected.logo_url ? (
                      <div className="flex items-center gap-3">
                        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          <img src={selected.logo_url} alt="Client logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white disabled:opacity-60">
                            {uploading ? "Uploading..." : "Replace"}
                          </button>
                          <button onClick={removeLogo} disabled={uploading}
                            className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-60">
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-4 text-sm text-white/50 hover:border-[#C8F31D]/40 hover:text-white disabled:opacity-60">
                        <Upload size={14} />
                        {uploading ? "Uploading..." : "Upload Logo"}
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }} />
                    {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}
                  </div>
                  <Row label="Logo Notes"  value={selected.logo} />
                  <Row label="Colours"     value={selected.colors} />
                  <Row label="Style"       value={selected.style} />
                  <Row label="Inspiration" value={selected.inspo} />
                </div>
              </div>

              {/* Client Credentials */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/35">Client Credentials</p>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <DashboardCredentialsSection
                    submissionId={selected.id}
                    onViewCredentials={setCredentialsViewId}
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {credentialsViewId && (
          <CredentialsViewer credentialsId={credentialsViewId} onClose={() => setCredentialsViewId(null)} />
        )}
      </div>
    </div>
  );
}