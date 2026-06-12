"use client";

import { useState } from "react";
import { Send, CheckCircle2, Crown, ClipboardList, Palette, Code2, Rocket, Check, ShieldCheck } from "lucide-react";
import { SERVICES } from "@/lib/services";

const field = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-brand-mint/60";
const labelCls = "mb-1.5 block text-sm font-medium text-white/80";
const darkOpt = { background: "#0f0a1a", color: "#e9e6f2" };

/* ─── process steps ─── */
const STEPS = [
  { icon: ClipboardList, title: "1. Submit", desc: "Fill out this form with your project details." },
  { icon: Palette, title: "2. Review", desc: "Our team reviews and reaches out within 24–48h." },
  { icon: Code2, title: "3. Build", desc: "We design & develop your website to spec." },
  { icon: Rocket, title: "4. Launch", desc: "Final review, revisions, and go live." },
];

/* ─── packages ─── */
type Pkg = { id: string; name: string; price: string; tagline: string; pages: number; includes: string[] };
const PACKAGES: Pkg[] = [
  { id: "starter", name: "Starter", price: "$79", tagline: "Clean, professional website to get online fast.", pages: 5, includes: ["Up to 5 pages", "Contact form", "Mobile responsive", "Stock photos", "Basic on-page SEO"] },
  { id: "standard", name: "Standard", price: "$149", tagline: "Everything you need to grow and convert.", pages: 7, includes: ["Up to 7 pages", "Contact form", "Admin portal", "Gallery management", "Mobile responsive", "Blog / CMS ready"] },
];

/* ─── add-ons ─── */
type Addon = { id: string; label: string; desc: string; premium?: boolean };
const ADDONS: Addon[] = [
  { id: "logo", label: "Logo Design", desc: "Professional logo crafted for your brand", premium: true },
  { id: "domain", label: "Domain Purchase & Setup", desc: "We buy and configure your domain", premium: true },
  { id: "extra-pages", label: "Extra Pages", desc: "Additional pages beyond your plan", premium: true },
  { id: "admin-portal", label: "Admin Portal", desc: "Manage content from a dashboard", premium: true },
  { id: "customer-portal", label: "Customer Portal", desc: "Login area for your customers", premium: true },
  { id: "payment", label: "Payment Integration", desc: "Accept payments on your site", premium: true },
  { id: "ecommerce", label: "eCommerce / Online Store", desc: "Sell products with cart & checkout", premium: true },
  { id: "booking", label: "Online Booking System", desc: "Let clients book appointments", premium: true },
  { id: "newsletter", label: "Email Newsletter", desc: "Capture leads with email signup", premium: true },
  { id: "crm", label: "CRM Integration", desc: "Connect to your CRM (GoHighLevel, etc.)", premium: true },
  { id: "multilang", label: "Multi-Language", desc: "Website in multiple languages", premium: true },
  { id: "custom-design", label: "Fully Custom Design", desc: "Bespoke design, no templates", premium: true },
  { id: "social-feed", label: "Social Media Feed", desc: "Live Instagram/Facebook feed on site" },
  { id: "google-maps", label: "Google Maps", desc: "Embed your business location" },
];

const GOALS = ["Generate leads", "Sell products online", "Book appointments", "Build brand awareness", "Showcase portfolio", "Inform customers"];
const STYLES = ["Modern & minimalist", "Bold & graphic", "Corporate & professional", "Warm & approachable", "Luxury & high-end", "Dark & sleek"];
const LOGO_OPTS = ["Yes — I'll upload it", "No — I need one designed", "Have one but needs updating"];
const PAGES = ["Home", "About Us", "Services", "Contact", "Gallery / Portfolio", "Testimonials", "FAQ", "Pricing", "Blog / News", "Products / Shop", "Booking", "Our Team"];

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
  const [pkg, setPkg] = useState<string>("");
  const [addons, setAddons] = useState<string[]>([]);
  const [f, setF] = useState({
    business: "", name: "", email: "", phone: "", site: "", social: "",
    service: "", goal: "", audience: "",
    logo: "", colors: "", style: "", inspo: "",
    pages: [] as string[], headline: "", about: "", notes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v })); if (status === "error") setStatus("idle"); };
  const togglePage = (v: string) => setF((p) => ({ ...p, pages: p.pages.includes(v) ? p.pages.filter((x) => x !== v) : [...p.pages, v] }));
  const toggleAddon = (id: string) => setAddons((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const selectedPkg = PACKAGES.find((p) => p.id === pkg);

  const submit = async () => {
    if (!pkg) { setStatus("error"); setErr("Please select a package first."); return; }
    if (!f.business || !f.name || !f.email || !f.phone) {
      setStatus("error"); setErr("Please fill in your business, name, email and phone."); return;
    }
    setStatus("sending"); setErr("");
    try {
      const addonLabels = addons.map((id) => ADDONS.find((a) => a.id === id)?.label || id);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          package: selectedPkg ? `${selectedPkg.name} (${selectedPkg.price})` : "",
          addons: addonLabels,
          pages: f.pages,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus("sent");
      else { setStatus("error"); setErr(data.error || "Something went wrong."); }
    } catch {
      setStatus("error"); setErr("Network error. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <section className="py-16"><div className="section">
        <div className="mx-auto max-w-lg rounded-3xl glass-strong p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-mint/15 text-brand-mint shadow-glow-mint">
            <CheckCircle2 size={34} />
          </span>
          <h3 className="mt-5 text-2xl font-bold text-white">Submitted successfully!</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Thanks {f.name.split(" ")[0]} — our team will review your details and reach out within 24–48 hours to begin.
          </p>
        </div>
      </div></section>
    );
  }

  return (
    <section className="relative py-12 sm:py-16">
      <div className="section">

        {/* ── Process steps ── */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl glass p-3 sm:p-4 text-center">
              <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-brand-mint/10 text-brand-mint"><s.icon size={18} /></span>
              <div className="text-sm font-bold text-white">{s.title}</div>
              <p className="mt-1 text-xs leading-snug text-white/50">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl rounded-3xl glass-strong p-5 sm:p-6 md:p-8">

          {/* ── Pay-after note ── */}
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-brand-mint/30 bg-brand-mint/10 px-4 py-3 text-center sm:text-left">
            <ShieldCheck size={18} className="hidden shrink-0 text-brand-mint sm:block" />
            <p className="w-full text-xs font-semibold text-brand-mint sm:text-sm">
              Pay after you are satisfied with your design — no payment is required to submit this form.
            </p>
          </div>

          {/* ── Step 1: Package ── */}
          <Divider>Choose Your Package</Divider>
          <div className="grid gap-4 sm:grid-cols-2">
            {PACKAGES.map((p) => (
              <button key={p.id} type="button" onClick={() => setPkg(p.id)}
                className={`relative flex flex-col rounded-2xl p-5 text-left transition-all ${pkg === p.id ? "neon-border shadow-glow-purple" : "glass hover:shadow-glow-purple"}`}>
                {pkg === p.id && <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-brand-mint text-ink"><Check size={14} strokeWidth={3} /></span>}
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-mint">{p.name}</div>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-white">{p.price}</span>
                  <span className="mb-0.5 text-xs text-white/45">one-time</span>
                </div>
                <p className="mt-2 text-sm text-white/55">{p.tagline}</p>
                <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                  {p.includes.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-xs text-white/65"><Check size={12} className="shrink-0 text-brand-mint" />{it}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* ── Add-ons ── */}
          <Divider>Add-Ons</Divider>
          <p className="mb-4 text-xs text-white/50">Select any extras you need. Items marked with <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-300"><Crown size={10} /> ADDITIONAL COST</span> will be quoted separately based on your selected package.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ADDONS.map((a) => {
              const on = addons.includes(a.id);
              return (
                <button key={a.id} type="button" onClick={() => toggleAddon(a.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${on ? "border-brand-mint bg-brand-mint/10" : "border-white/8 bg-white/[0.02] hover:border-white/20"}`}>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border text-[10px] font-bold ${on ? "border-brand-mint bg-brand-mint text-ink" : "border-white/20 text-transparent"}`}>
                    {on && <Check size={12} strokeWidth={3} />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${on ? "text-white" : "text-white/75"}`}>{a.label}</span>
                      {a.premium && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                          <Crown size={9} /> + Additional Cost
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/45">{a.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Contact ── */}
          <Divider>Your Details</Divider>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Business name <span className="text-brand-mint">*</span></label><input className={field} value={f.business} onChange={(e) => set("business", e.target.value)} placeholder="e.g. ABC Consulting" /></div>
            <div><label className={labelCls}>Contact person <span className="text-brand-mint">*</span></label><input className={field} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="First and last name" /></div>
            <div><label className={labelCls}>Email <span className="text-brand-mint">*</span></label><input type="email" className={field} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@business.com" /></div>
            <div><label className={labelCls}>Phone <span className="text-brand-mint">*</span></label><input type="tel" className={field} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (___) ___-____" /></div>
            <div><label className={labelCls}>Current website</label><input type="url" className={field} value={f.site} onChange={(e) => set("site", e.target.value)} placeholder="https://..." /></div>
            <div><label className={labelCls}>Social media</label><input className={field} value={f.social} onChange={(e) => set("social", e.target.value)} placeholder="Instagram, Facebook..." /></div>
          </div>

          {/* ── Project ── */}
          <Divider>Project Details</Divider>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Service</label><Select value={f.service} onChange={(v) => set("service", v)} placeholder="Select a service" options={SERVICES} /></div>
            <div><label className={labelCls}>Main goal</label><Select value={f.goal} onChange={(v) => set("goal", v)} placeholder="Select goal" options={GOALS} /></div>
          </div>
          <div className="mt-4"><label className={labelCls}>Target audience</label><textarea className={`${field} min-h-[70px] resize-y`} value={f.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Who are your ideal customers?" /></div>

          {/* ── Brand ── */}
          <Divider>Brand &amp; Design</Divider>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Logo</label><Select value={f.logo} onChange={(v) => set("logo", v)} placeholder="Select" options={LOGO_OPTS} /></div>
            <div><label className={labelCls}>Design style</label><Select value={f.style} onChange={(v) => set("style", v)} placeholder="Select style" options={STYLES} /></div>
          </div>
          <div className="mt-4"><label className={labelCls}>Brand colours</label><input className={field} value={f.colors} onChange={(e) => set("colors", e.target.value)} placeholder="e.g. Purple #8C00FF — or 'help me choose'" /></div>
          <div className="mt-4"><label className={labelCls}>Inspiration websites</label><textarea className={`${field} min-h-[70px] resize-y`} value={f.inspo} onChange={(e) => set("inspo", e.target.value)} placeholder="2–3 links and what you like" /></div>

          {/* ── Pages ── */}
          <Divider>Pages You Need</Divider>
          <p className="mb-3 text-xs text-white/50">Your {selectedPkg?.name || "—"} plan includes up to {selectedPkg?.pages || "—"} pages. Extra pages are available as an add-on.</p>
          <Pills options={PAGES} selected={f.pages} onToggle={togglePage} />

          <div className="mt-4"><label className={labelCls}>Homepage headline</label><input className={field} value={f.headline} onChange={(e) => set("headline", e.target.value)} placeholder="First thing visitors read" /></div>
          <div className="mt-4"><label className={labelCls}>About your business</label><textarea className={`${field} min-h-[80px] resize-y`} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="What you do, mission, story..." /></div>
          <div className="mt-4"><label className={labelCls}>Anything else?</label><textarea className={`${field} min-h-[70px] resize-y`} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Deadlines, special requests..." /></div>

          {status === "error" && <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <span className="text-xs text-white/40">🔒 Your information is secure and only used for your project.</span>
            <button onClick={submit} disabled={status === "sending"}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-ink shadow-glow-mint transition-all hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
              style={{ background: "linear-gradient(100deg, var(--brand-mint), var(--brand-purple-light))" }}>
              <Send size={16} /> {status === "sending" ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}