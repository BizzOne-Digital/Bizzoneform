"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, LogOut, RefreshCw, X, Trash2 } from "lucide-react";

type Status = "new" | "in_progress" | "done" | "on_hold";
type Sub = {
  id: string; created_at: string; business: string; name: string;
  email: string; phone: string; package: string; addons: string;
  site: string; social: string; goal: string; audience: string;
  logo: string; colors: string; style: string; inspo: string;
  pages: string; headline: string; about: string; notes: string;
  status: Status; assigned_to: string; internal_notes: string;
  services_list: string; pricing_details: string; has_pricing: string;
  contact_page: string; special_offers: string; file_details: string;
};

const BADGE: Record<Status, string> = {
  new:         "bg-[#C8F31D]/15 text-[#C8F31D]",
  in_progress: "bg-blue-500/15 text-blue-400",
  done:        "bg-green-500/15 text-green-400",
  on_hold:     "bg-amber-500/15 text-amber-400",
};
const LABEL: Record<Status, string> = {
  new: "New", in_progress: "In Progress", done: "Done", on_hold: "On Hold"
};

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
  const [selected, setSelected] = useState<Sub | null>(null);
  const [saving, setSaving]   = useState(false);
  const [eStatus, setEStatus] = useState<Status>("new");
  const [eAssign, setEAssign] = useState("");
  const [eNotes, setENotes]   = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter !== "all") p.set("status", filter);
    if (search) p.set("search", search);
    const res = await fetch(`/api/submissions?${p}`);
    if (res.ok) setSubs(await res.json());
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const open = (s: Sub) => {
    setSelected(s);
    setEStatus(s.status);
    setEAssign(s.assigned_to || "");
    setENotes(s.internal_notes || "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status: eStatus, assigned_to: eAssign, internal_notes: eNotes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubs(p => p.map(s => s.id === updated.id ? updated : s));
      setSelected(updated);
      setEStatus(updated.status);
    }
    setSaving(false);
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
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Status</p>
          {FILTERS.map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm mb-1 transition-all ${filter === f.k ? "bg-white/8 text-white font-semibold" : "text-white/50 hover:text-white hover:bg-white/4"}`}>
              {f.l}
              <span className="text-xs text-white/30">{counts[f.k] || 0}</span>
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
                      {["Business", "Contact", "Package", "Date", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/35">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(s => (
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
                <input className="w-full rounded-xl border border-white/10 bg-[#05060A] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#C8F31D]/50"
                  value={eAssign} onChange={e => setEAssign(e.target.value)} placeholder="Assigned to (team member)" />
                <textarea className="w-full rounded-xl border border-white/10 bg-[#05060A] min-h-[70px] resize-y px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#C8F31D]/50"
                  value={eNotes} onChange={e => setENotes(e.target.value)} placeholder="Internal notes..." />
                <button onClick={save} disabled={saving}
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
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-1">
                  <Row label="Package"  value={selected.package} />
                  <Row label="Add-Ons"  value={selected.addons} />
                  <Row label="Submitted" value={fmt(selected.created_at)} />
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
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-1">
                  <Row label="Logo"        value={selected.logo} />
                  <Row label="Colours"     value={selected.colors} />
                  <Row label="Style"       value={selected.style} />
                  <Row label="Inspiration" value={selected.inspo} />
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}