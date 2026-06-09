"use client";

import { useState } from "react";
import { Send, CheckCircle2, Phone, Mail, Clock } from "lucide-react";
import { SERVICES } from "@/lib/services";

const field = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-brand-mint/60";
const darkOpt = { background: "#0f0a1a", color: "#e9e6f2" };

const TRUST = [
  { icon: Clock, text: "Reply within 24–48 hours" },
  { icon: Phone, text: "Free strategy consultation" },
  { icon: Mail, text: "No spam, ever" },
];

export default function LeadForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", business: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v })); if (status === "error") setStatus("idle"); };

  const submit = async () => {
    if (!f.name || !f.email || !f.message) {
      setStatus("error"); setErr("Please fill in your name, email and message."); return;
    }
    setStatus("sending"); setErr("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus("sent");
      else { setStatus("error"); setErr(data.error || "Something went wrong. Please try again."); }
    } catch {
      setStatus("error"); setErr("Network error. Please try again.");
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-4xl">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Trust points */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-bold text-white">Why work with us?</h2>
          <ul className="mt-5 space-y-4">
            {TRUST.map((t) => (
              <li key={t.text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-mint/10 text-brand-mint"><t.icon size={16} /></span>
                {t.text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#8C00FF","#C8F31D","#B47BFF"].map((c,i) => (
                <span key={i} className="h-9 w-9 rounded-full border-2 border-ink" style={{ background: `linear-gradient(135deg, ${c}, #0b0e18)` }} />
              ))}
            </div>
            <p className="text-xs text-white/55">Trusted by <strong className="text-white">500+</strong> businesses worldwide</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl glass-strong p-6 sm:p-7">
          {status === "sent" ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-mint/15 text-brand-mint shadow-glow-mint">
                <CheckCircle2 size={34} />
              </span>
              <h3 className="mt-5 text-2xl font-bold text-white">Message sent!</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
                Thanks {f.name.split(" ")[0]} — our team will reach out within 24–48 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">Full name <span className="text-brand-mint">*</span></label>
                  <input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">Phone</label>
                  <input type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (___) ___-____" />
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">Email <span className="text-brand-mint">*</span></label>
                  <input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@business.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/80">Business name</label>
                  <input className={field} value={f.business} onChange={(e) => set("business", e.target.value)} placeholder="Your company" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-white/80">Service you need</label>
                <select className={field} value={f.service} onChange={(e) => set("service", e.target.value)}>
                  <option value="" style={darkOpt}>Select a service</option>
                  {SERVICES.map((s) => <option key={s} value={s} style={darkOpt}>{s}</option>)}
                </select>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-white/80">Message <span className="text-brand-mint">*</span></label>
                <textarea className={`${field} min-h-[110px] resize-y leading-relaxed`} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your project or goals..." />
              </div>
              {status === "error" && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}
              <button onClick={submit} disabled={status === "sending"}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-ink shadow-glow-mint transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "linear-gradient(100deg, var(--brand-mint), var(--brand-purple-light))" }}>
                <Send size={16} /> {status === "sending" ? "Sending..." : "Send Message"}
              </button>
              <p className="mt-3 text-center text-[11px] text-white/35">🔒 Secure &amp; private — used only for your project.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
