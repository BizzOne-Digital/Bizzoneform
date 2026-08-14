"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, Link2, RefreshCw, XCircle } from "lucide-react";
import { FIELD_LABELS } from "@/lib/credentials-labels";

type CredInfo = {
  status: string;
  credentials_id?: string;
  token_created_at?: string;
  token_expires_at?: string;
  submitted_at?: string;
  payment_method?: string;
};

type CredMeta = {
  id: string;
  client_name: string;
  site_name: string;
  submitted_at: string;
  payment_method: string;
  domain_provider?: string;
  field_ids: string[];
};

export function DashboardCredentialsSection({
  submissionId,
  onViewCredentials,
}: {
  submissionId: string;
  onViewCredentials: (credentialsId: string) => void;
}) {
  const [info, setInfo] = useState<CredInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/credentials/request/${submissionId}`);
      if (res.ok) setInfo(await res.json());
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/credentials/request/${submissionId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setPublicUrl(data.public_url);
        setInfo(data.info);
      } else alert(data.error || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!confirm("Revoke this credentials link?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/credentials/request/${submissionId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { setInfo(data.info); setPublicUrl(""); }
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/credentials/request/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate" }),
      });
      const data = await res.json();
      if (res.ok) { setPublicUrl(data.public_url); setInfo(data.info); }
    } finally {
      setBusy(false);
    }
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <p className="text-xs text-white/40">Loading credentials...</p>;

  const status = info?.status || "not_requested";

  return (
    <div className="space-y-3">
      {status === "not_requested" && (
        <>
          <p className="text-xs text-white/45">
            Share <span className="text-brand-mint">credentials.bizzonedigital.com</span> with the client.
            When they submit using the same name and business as onboarding, credentials appear here automatically.
          </p>
          <button onClick={generate} disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-xs font-semibold text-white/60 hover:text-white disabled:opacity-50">
            <Link2 size={14} /> Optional: generate personal secure link
          </button>
          {publicUrl && (
            <div className="rounded-xl border border-white/10 bg-[#05060A] p-3">
              <p className="mb-1 text-[10px] text-white/40">Share with client:</p>
              <code className="block break-all text-[11px] text-brand-mint">{publicUrl}</code>
              <button onClick={() => copy(publicUrl)} className="mt-2 text-xs font-semibold text-white/60 hover:text-white">
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
        </>
      )}

      {(status === "waiting" || status === "expired" || status === "revoked") && (
        <>
          <p className="text-xs text-white/45">
            Status: <span className="text-white capitalize">{status === "waiting" ? "Waiting for client" : status}</span>
          </p>
          {info?.token_expires_at && (
            <p className="text-xs text-white/45">Expires: <span className="text-white">{new Date(info.token_expires_at).toLocaleString()}</span></p>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={regenerate} disabled={busy} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white">
              <RefreshCw size={12} className="inline mr-1" />Regenerate
            </button>
            <button onClick={revoke} disabled={busy} className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400">
              <XCircle size={12} className="inline mr-1" />Revoke
            </button>
          </div>
          {publicUrl && (
            <button onClick={() => copy(publicUrl)} className="text-xs font-semibold text-brand-mint">{copied ? "Copied!" : "Copy link"}</button>
          )}
        </>
      )}

      {status === "submitted" && info?.credentials_id && (
        <>
          <p className="text-xs text-white/45">
            Submitted: <span className="text-white">{info.submitted_at ? new Date(info.submitted_at).toLocaleString() : "—"}</span>
          </p>
          <p className="text-xs text-white/45">
            Payment: <span className="text-white capitalize">{info.payment_method || "—"}</span>
          </p>
          <button onClick={() => onViewCredentials(info.credentials_id!)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-mint py-2.5 text-sm font-bold text-black hover:brightness-110">
            <KeyRound size={14} /> View submitted credentials
          </button>
        </>
      )}
    </div>
  );
}

export function CredentialsViewer({ credentialsId, onClose }: { credentialsId: string; onClose: () => void }) {
  const [meta, setMeta] = useState<CredMeta | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    fetch(`/api/credentials/${credentialsId}`)
      .then(r => r.ok ? r.json() : null)
      .then(setMeta);
    const hide = () => { setRevealed({}); Object.values(timers.current).forEach(clearTimeout); };
    window.addEventListener("blur", hide);
    return () => { window.removeEventListener("blur", hide); Object.values(timers.current).forEach(clearTimeout); };
  }, [credentialsId]);

  const reveal = async (fieldId: string) => {
    const res = await fetch(`/api/credentials/${credentialsId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_id: fieldId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setRevealed(p => ({ ...p, [fieldId]: data.value }));
    if (timers.current[fieldId]) clearTimeout(timers.current[fieldId]);
    timers.current[fieldId] = setTimeout(() => {
      setRevealed(p => { const n = { ...p }; delete n[fieldId]; return n; });
    }, 60000);
  };

  const copy = async (fieldId: string) => {
    let val = revealed[fieldId];
    if (!val) {
      const res = await fetch(`/api/credentials/${credentialsId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_id: fieldId }),
      });
      if (!res.ok) return;
      val = (await res.json()).value;
    }
    await navigator.clipboard.writeText(val);
  };

  if (!meta) return <p className="text-xs text-white/40 p-5">Loading credentials...</p>;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/50" onClick={onClose}>
      <aside className="h-full w-full max-w-md overflow-y-auto border-l border-white/8 bg-[#08080f] shadow-2xl sm:w-[420px]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-[#08080f] px-5 py-4">
          <div>
            <p className="font-bold text-white">Client Credentials</p>
            <p className="text-xs text-white/45">{meta.client_name} · {meta.site_name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><XCircle size={18} /></button>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
            <p className="text-xs text-white/40">Submitted</p>
            <p className="text-white/85">{new Date(meta.submitted_at).toLocaleString()}</p>
            <p className="mt-2 text-xs text-white/40">Payment method</p>
            <p className="capitalize text-white/85">{meta.payment_method}</p>
            {meta.domain_provider && (
              <>
                <p className="mt-2 text-xs text-white/40">Domain provider</p>
                <p className="text-white/85">{meta.domain_provider}</p>
              </>
            )}
          </div>
          {meta.field_ids.map(fid => (
            <div key={fid} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="mb-2 text-xs text-white/40">{FIELD_LABELS[fid] || fid}</p>
              <p className="mb-3 break-all font-mono text-sm text-white/85">{revealed[fid] || "••••••••••••••••"}</p>
              <div className="flex gap-2">
                {!revealed[fid] ? (
                  <button onClick={() => reveal(fid)} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white">
                    <Eye size={12} /> Reveal
                  </button>
                ) : (
                  <button onClick={() => setRevealed(p => { const n = { ...p }; delete n[fid]; return n; })}
                    className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white">
                    <EyeOff size={12} /> Hide
                  </button>
                )}
                <button onClick={() => copy(fid)} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70 hover:text-white">
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
