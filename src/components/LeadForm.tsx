"use client";

import { useState } from "react";
import { Send, CheckCircle2, Phone, Mail, Clock } from "lucide-react";
import { SERVICES } from "@/lib/services";

const PRIORITY_OPTS = ["Urgent — ASAP", "High — 1 to 2 weeks", "Medium — 3 to 4 weeks", "Low — flexible"];
const GOALS = ["Generate leads and inquiries", "Sell products online (eCommerce)", "Book appointments or services", "Build brand awareness", "Showcase a portfolio", "Inform existing customers"];
const STYLES = ["Modern & minimalist", "Bold & graphic", "Corporate & professional", "Warm & approachable", "Luxury & high-end", "Playful & creative", "Dark & sleek"];
const LOGO_OPTS = ["Yes — I'll upload it", "No — I need one designed", "Have one but needs updating"];
const PRICING_OPTS = ["Yes — display prices", "No — contact for pricing", "Starting price range only"];
const DOMAIN_OPTS = ["Yes, I own one", "No — please set it up"];
const HOSTING_OPTS = ["Yes, I have hosting", "No — please set it up"];
const PAGES = ["Home", "About Us", "Services", "Contact", "Gallery / Portfolio", "Testimonials", "FAQ", "Pricing", "Blog / News", "Products / Shop", "Booking", "Our Team"];
const FEATURES = ["Contact form", "Google Maps", "Social media feed", "Gallery management", "Admin portal", "Blog CMS", "Online booking", "Customer portal", "Payment integration", "Email newsletter", "CRM integration", "eCommerce / store", "Multi-language"];

const field = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-brand-mint/60";
const labelCls = "mb-1.5 block text-sm font-medium text-white/80";
const darkOpt = { background: "#0f0a1a", color: "#e9e6f2" };

const TRUST = [
  { icon: Clock, text: "Reply within 24–48 hours" },
  { icon: Phone, text: "Free strategy consultation" },
  { icon: Mail, text: "No spam, ever" },
];

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-mint/80">
      <span className="h-px flex-1 bg-white/10" />{children}<span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Pills({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${on ? "border-brand-mint bg-brand-mint/15 text-brand-mint" : "border-white/12 text-white/65 hover:border-white/30"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <select className={field} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" style={darkOpt}>{placeholder}</option>
      {options.map((o) => <option key={o} value={o} style={darkOpt}>{o}</option>)}
    </select>
  );
}

export default function LeadForm() {
  const [f, setF] = useState({
    priority: "", business: "", name: "", email: "", phone: "", address: "", site: "", social: "",
    service: "", launch: "", goal: "", audience: "", usp: "",
    logo: "", colors: "", style: "", inspo: "",
    pages: [] as string[], headline: "", about: "", services: "", pricing: "",
    domain: "", hosting: "", features: [] as string[], notes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v })); if (status === "error") setStatus("idle"); };
  const toggle = (k: "pages" | "features", v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const submit = async () => {
    if (!f.business || !f.name || !f.email || !f.phone) {
      setStatus("error"); setErr("Please fill in your business, name, email and phone first."); return;
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
      <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.5fr]">
        {/* Trust points */}
        <div className="hidden lg:block lg:sticky lg:top-28">
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
        <div className="rounded-3xl glass-strong p-6 sm:p-8">
          {status === "sent" ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-mint/15 text-brand-mint shadow-glow-mint">
                <CheckCircle2 size={34} />
              </span>
              <h3 className="mt-5 text-2xl font-bold text-white">Submitted successfully!</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
                Thanks {f.name.split(" ")[0]} — our team will reach out within 24–48 hours.
              </p>
            </div>
          ) : (
            <>
              {/* Contact & Project */}
              <Divider>Contact &amp; Project</Divider>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Project priority</label><Select value={f.priority} onChange={(v) => set("priority", v)} placeholder="Select priority" options={PRIORITY_OPTS} /></div>
                <div><label className={labelCls}>Expected timeline</label><input type="date" className={field} style={{ colorScheme: "dark" }} value={f.launch} onChange={(e) => set("launch", e.target.value)} /></div>
                <div><label className={labelCls}>Business name <span className="text-brand-mint">*</span></label><input className={field} value={f.business} onChange={(e) => set("business", e.target.value)} placeholder="e.g. ABC Consulting" /></div>
                <div><label className={labelCls}>Main contact person <span className="text-brand-mint">*</span></label><input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="First and last name" /></div>
                <div><label className={labelCls}>Email address <span className="text-brand-mint">*</span></label><input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@business.com" /></div>
                <div><label className={labelCls}>Phone number <span className="text-brand-mint">*</span></label><input type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (___) ___-____" /></div>
              </div>
              <div className="mt-4"><label className={labelCls}>Business address</label><input className={field} value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, City, Country (optional)" /></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Current website</label><input type="url" className={field} value={f.site} onChange={(e) => set("site", e.target.value)} placeholder="https://..." /></div>
                <div><label className={labelCls}>Social media links</label><input className={field} value={f.social} onChange={(e) => set("social", e.target.value)} placeholder="Instagram, Facebook..." /></div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Service you need</label><Select value={f.service} onChange={(v) => set("service", v)} placeholder="Select a service" options={SERVICES} /></div>
                <div><label className={labelCls}>Main goal</label><Select value={f.goal} onChange={(v) => set("goal", v)} placeholder="Select goal" options={GOALS} /></div>
              </div>
              <div className="mt-4"><label className={labelCls}>Target audience</label><textarea className={`${field} min-h-[80px] resize-y`} value={f.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Who are your ideal customers?" /></div>
              <div className="mt-4"><label className={labelCls}>What makes your business different?</label><textarea className={`${field} min-h-[80px] resize-y`} value={f.usp} onChange={(e) => set("usp", e.target.value)} placeholder="Your edge over competitors" /></div>

              {/* Brand & Design */}
              <Divider>Brand &amp; Design</Divider>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Do you have a logo?</label><Select value={f.logo} onChange={(v) => set("logo", v)} placeholder="Select" options={LOGO_OPTS} /></div>
                <div><label className={labelCls}>Design style</label><Select value={f.style} onChange={(v) => set("style", v)} placeholder="Select style" options={STYLES} /></div>
              </div>
              <div className="mt-4"><label className={labelCls}>Brand colours</label><input className={field} value={f.colors} onChange={(e) => set("colors", e.target.value)} placeholder="e.g. Purple #8C00FF, Lime #C8F31D — or 'help me choose'" /></div>
              <div className="mt-4"><label className={labelCls}>Websites you love (inspiration)</label><textarea className={`${field} min-h-[80px] resize-y`} value={f.inspo} onChange={(e) => set("inspo", e.target.value)} placeholder="2–3 links and what you like about them" /></div>

              {/* Content */}
              <Divider>Website Content</Divider>
              <label className={labelCls}>Pages you need</label>
              <Pills options={PAGES} selected={f.pages} onToggle={(v) => toggle("pages", v)} />
              <div className="mt-4"><label className={labelCls}>Homepage headline</label><input className={field} value={f.headline} onChange={(e) => set("headline", e.target.value)} placeholder="The first line visitors read" /></div>
              <div className="mt-4"><label className={labelCls}>About your business</label><textarea className={`${field} min-h-[90px] resize-y`} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="What you do, mission, story..." /></div>
              <div className="mt-4"><label className={labelCls}>Services / products</label><textarea className={`${field} min-h-[90px] resize-y`} value={f.services} onChange={(e) => set("services", e.target.value)} placeholder="List with short descriptions and pricing" /></div>
              <div className="mt-4"><label className={labelCls}>Display pricing on the site?</label><Select value={f.pricing} onChange={(v) => set("pricing", v)} placeholder="Select" options={PRICING_OPTS} /></div>

              {/* Technical */}
              <Divider>Technical &amp; Features</Divider>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Do you own a domain?</label><Select value={f.domain} onChange={(v) => set("domain", v)} placeholder="Select" options={DOMAIN_OPTS} /></div>
                <div><label className={labelCls}>Do you have hosting?</label><Select value={f.hosting} onChange={(v) => set("hosting", v)} placeholder="Select" options={HOSTING_OPTS} /></div>
              </div>
              <div className="mt-4"><label className={labelCls}>Features you need</label><Pills options={FEATURES} selected={f.features} onToggle={(v) => toggle("features", v)} /></div>
              <div className="mt-4"><label className={labelCls}>Anything else we should know?</label><textarea className={`${field} min-h-[80px] resize-y`} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Deadlines, special requests..." /></div>

              {status === "error" && <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <span className="text-xs text-white/40">🔒 Secure &amp; private — used only for your project.</span>
                <button onClick={submit} disabled={status === "sending"}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-ink shadow-glow-mint transition-all hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
                  style={{ background: "linear-gradient(100deg, var(--brand-mint), var(--brand-purple-light))" }}>
                  <Send size={16} /> {status === "sending" ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}