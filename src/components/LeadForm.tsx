"use client";

import { useState } from "react";
import { Send, CheckCircle2, Crown, CreditCard, ClipboardList, Code2, Eye, Globe, Check, ShieldCheck, Upload, X } from "lucide-react";

const field = "w-full rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3.5 text-base text-white placeholder-white/40 outline-none transition-colors focus:border-brand-mint/60";
const labelCls = "mb-2 block text-base font-semibold text-white/90";
const darkOpt = { background: "#0f0a1a", color: "#e9e6f2" };

/* ── Issue 2 fix: Updated 5-step process ── */
const STEPS = [
  { icon: CreditCard, title: "Payment Confirmed", desc: "Your order is secured." },
  { icon: ClipboardList, title: "Share Your Details", desc: "Complete the quick form." },
  { icon: Code2, title: "We Start Building", desc: "Our team begins your website." },
  { icon: Eye, title: "Review & Approve", desc: "Check the final preview." },
  { icon: Globe, title: "Website Goes Live", desc: "We connect your domain." },
];

/* ── Issue 3 fix: packages are display-only, not clickable ── */
type Pkg = { id: string; name: string; price: string; tagline: string; pages: number; includes: string[] };
const PACKAGES: Pkg[] = [
  { id: "starter", name: "Starter", price: "$79", tagline: "Clean, professional website to get online fast.", pages: 5, includes: ["Up to 5 pages", "Contact form", "Mobile responsive", "Stock photos", "Basic on-page SEO"] },
  { id: "standard", name: "Standard", price: "$149", tagline: "Everything you need to grow and convert.", pages: 7, includes: ["Up to 7 pages", "Contact form", "Admin portal", "Gallery management", "Mobile responsive", "Blog / CMS ready"] },
];

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
];

const GOALS = ["Generate leads", "Sell products online", "Book appointments", "Build brand awareness", "Showcase portfolio", "Inform customers"];
const STYLES = ["Modern & minimalist", "Bold & graphic", "Corporate & professional", "Warm & approachable", "Luxury & high-end", "Dark & sleek"];
const LOGO_OPTS = ["Yes — I'll upload it", "No — I need one designed", "Have one but needs updating"];
const PAGES = ["Home", "About Us", "Services", "Contact", "Gallery / Portfolio", "Testimonials", "FAQ", "Pricing", "Blog / News", "Products / Shop", "Booking", "Our Team"];

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-mint">
      <span className="h-px flex-1 bg-white/12" />{children}<span className="h-px flex-1 bg-white/12" />
    </div>
  );
}

function Pills({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)}
            className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${on ? "border-brand-mint bg-brand-mint/20 text-brand-mint" : "border-white/15 text-white/70 hover:border-white/35"}`}>
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
  /* Issue 3: selectedPkg is the display-only selected package */
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [addons, setAddons] = useState<string[]>([]);
  const [f, setF] = useState({
    business: "", name: "", email: "", phone: "", site: "", social: "",
    goal: "", audience: "",
    logo: "", colors: "", style: "", inspo: "",
    pages: [] as string[], headline: "", about: "",
    servicesList: "", pricingDetails: "", hasPricing: "", contactPageInfo: "",
    specialOffers: "", fileDetails: "", notes: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");

  const uploadLogoFile = async (file: File) => {
    setLogoUploading(true);
    setLogoError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/lead/upload-logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setLogoUrl(data.url);
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    }
    setLogoUploading(false);
  };
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v })); if (status === "error") setStatus("idle"); };
  const togglePage = (v: string) => setF((p) => ({ ...p, pages: p.pages.includes(v) ? p.pages.filter((x) => x !== v) : [...p.pages, v] }));
  const toggleAddon = (id: string) => setAddons((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  /* Issue 1 fix: selectedPkg properly derived so template string renders correctly */
  const selectedPkg = PACKAGES.find((p) => p.id === selectedPkgId);

  const submit = async () => {
    // Package validation
    if (!selectedPkgId) { setStatus("error"); setErr("Please select your package first."); return; }
    
    // Business details validation
    if (!f.business || !f.name || !f.email || !f.phone) {
      setStatus("error"); setErr("Please fill in all your business details (Business name, Contact person, Email, Phone)."); return;
    }
    if (!f.site) { setStatus("error"); setErr("Please enter your current website."); return; }
    if (!f.social) { setStatus("error"); setErr("Please enter your social media handles."); return; }
    
    // Project details validation
    if (!f.goal) { setStatus("error"); setErr("Please select your main business goal."); return; }
    if (!f.audience) { setStatus("error"); setErr("Please describe your target audience."); return; }
    
    // Brand & Design validation
    if (!f.logo) { setStatus("error"); setErr("Please select a logo option."); return; }
    if (f.logo === "Yes — I'll upload it" && !logoUrl) { setStatus("error"); setErr("Please upload your logo file."); return; }
    if (!f.style) { setStatus("error"); setErr("Please select a design style."); return; }
    if (!f.colors) { setStatus("error"); setErr("Please enter your brand colours."); return; }
    if (!f.inspo) { setStatus("error"); setErr("Please provide inspiration websites (2-3 links)."); return; }
    
    // Pages validation
    if (f.pages.length === 0) { setStatus("error"); setErr("Please select at least one page for your website."); return; }
    if (!f.headline) { setStatus("error"); setErr("Please enter your homepage headline."); return; }
    if (!f.about) { setStatus("error"); setErr("Please describe your business."); return; }
    
    // Services & Contact validation
    if (!f.servicesList) { setStatus("error"); setErr("Please list your services with details."); return; }
    if (!f.contactPageInfo) { setStatus("error"); setErr("Please provide contact page information."); return; }
    
    // Pricing validation
    if (!f.hasPricing) { setStatus("error"); setErr("Please select a pricing option."); return; }
    if ((f.hasPricing === "Yes — display prices" || f.hasPricing === "Starting price range only") && !f.pricingDetails) {
      setStatus("error"); setErr("Please provide your pricing details."); return;
    }
    
    // Additional details validation
    if (!f.specialOffers) { setStatus("error"); setErr("Please enter your special offers or packages information."); return; }
    if (!f.fileDetails) { setStatus("error"); setErr("Please provide notes or file details information."); return; }
    if (!f.notes) { setStatus("error"); setErr("Please provide any additional notes or requirements."); return; }
    
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
          logo_url: logoUrl,
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
          <p className="mt-3 text-base leading-relaxed text-white/70">
            Thanks {f.name.split(" ")[0]} — our team will review your details and reach out within 24–48 hours to begin.
          </p>
        </div>
      </div></section>
    );
  }

  return (
    <section className="relative py-12 sm:py-16">
      <div className="section">

        {/* ── Issue 2 fix: 5-step process ── */}
        <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl glass p-5 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-mint/15 text-brand-mint"><s.icon size={24} /></span>
              <div className="text-base font-bold text-white">{s.title}</div>
              <p className="mt-1.5 text-sm leading-snug text-white/80">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl rounded-3xl glass-strong p-5 sm:p-8">

          {/* ── Issue 3 fix: YOUR SELECTED PACKAGE — display only ── */}
          <Divider>Your Selected Package</Divider>

          {/* Selector — client must confirm which package they purchased */}
          {!selectedPkgId ? (
            <>
              <p className="mb-4 text-sm text-white/60">Please select the package you purchased to continue.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {PACKAGES.map((p) => (
                  <button key={p.id} type="button" onClick={() => setSelectedPkgId(p.id)}
                    className="flex flex-col rounded-2xl glass p-5 text-left transition-all hover:shadow-glow-purple">
                    <div className="text-sm font-bold uppercase tracking-wide text-brand-mint">{p.name}</div>
                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-white">{p.price}</span>
                      <span className="mb-1 text-sm text-white/50">one-time</span>
                    </div>
                    <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      {p.includes.map((it) => (
                        <li key={it} className="flex items-center gap-2.5 text-sm text-white/70"><Check size={14} className="shrink-0 text-brand-mint" />{it}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Display-only selected package */}
              <div className="rounded-2xl neon-border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-brand-mint">{selectedPkg?.name}</div>
                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-white">{selectedPkg?.price}</span>
                      <span className="mb-1 text-sm text-white/50">one-time</span>
                    </div>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-mint text-ink"><Check size={16} strokeWidth={3} /></span>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-3">
                  {selectedPkg?.includes.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-white/70"><Check size={13} className="shrink-0 text-brand-mint" />{it}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-sm text-white/50">This reflects the package you purchased. Need to make a change? Reply to your confirmation message or contact us directly.</p>
              <button onClick={() => setSelectedPkgId("")} className="mt-2 text-xs text-brand-mint underline">Change package</button>
            </>
          )}

          {/* ── Add-ons ── */}
          <Divider>Add-Ons</Divider>
          {/* Issue 4 fix: pricing guidance note */}
          <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-white/70">
            Select anything that applies to your project. Add-ons marked with <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400"><Crown size={10} /> ADDITIONAL COST</span> will be reviewed by your project manager and quoted separately before any work begins. <strong className="text-white">You will not be charged without approval.</strong>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {ADDONS.map((a) => {
              const on = addons.includes(a.id);
              return (
                <button key={a.id} type="button" onClick={() => toggleAddon(a.id)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${on ? "border-brand-mint bg-brand-mint/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border text-[10px] font-bold ${on ? "border-brand-mint bg-brand-mint text-ink" : "border-white/25 text-transparent"}`}>
                    {on && <Check size={12} strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold ${on ? "text-white" : "text-white/80"}`}>{a.label}</span>
                      {a.premium && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400">
                          <Crown size={9} /> + Additional Cost
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">{a.desc}</p>
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
            <div><label className={labelCls}>Current website <span className="text-brand-mint">*</span></label><input type="url" className={field} value={f.site} onChange={(e) => set("site", e.target.value)} placeholder="https://..." /></div>
            <div><label className={labelCls}>Social media <span className="text-brand-mint">*</span></label><input className={field} value={f.social} onChange={(e) => set("social", e.target.value)} placeholder="Instagram, Facebook..." /></div>
          </div>

          {/* ── Project ── */}
          <Divider>Project Details</Divider>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Main goal <span className="text-brand-mint">*</span></label><Select value={f.goal} onChange={(v) => set("goal", v)} placeholder="Select goal" options={GOALS} /></div>
          </div>
          <div className="mt-4"><label className={labelCls}>Target audience <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[80px] resize-y`} value={f.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Who are your ideal customers?" /></div>

          {/* ── Brand ── */}
          <Divider>Brand &amp; Design</Divider>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Logo <span className="text-brand-mint">*</span></label><Select value={f.logo} onChange={(v) => set("logo", v)} placeholder="Select" options={LOGO_OPTS} /></div>
            <div><label className={labelCls}>Design style <span className="text-brand-mint">*</span></label><Select value={f.style} onChange={(v) => set("style", v)} placeholder="Select style" options={STYLES} /></div>
          </div>

          {f.logo === "Yes — I'll upload it" && (
            <div className="mt-4">
              <label className={labelCls}>Upload your logo file <span className="text-brand-mint">*</span></label>
              {logoUrl ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] p-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10">
                    <img src={logoUrl} alt="Uploaded logo" className="h-full w-full object-contain" />
                  </div>
                  <span className="flex-1 text-sm text-white/70">Logo uploaded successfully</span>
                  <button type="button" onClick={() => setLogoUrl("")} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-6 text-sm text-white/60 hover:border-brand-mint/50 hover:text-white ${logoUploading ? "opacity-60" : ""}`}>
                  <Upload size={16} />
                  {logoUploading ? "Uploading..." : "Click to choose a file (PNG, JPG, SVG, WEBP — max 5MB)"}
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" disabled={logoUploading}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadLogoFile(file); e.target.value = ""; }} />
                </label>
              )}
              {logoError && <p className="mt-2 text-xs text-red-400">{logoError}</p>}
            </div>
          )}

          <div className="mt-4"><label className={labelCls}>Brand colours <span className="text-brand-mint">*</span></label><input className={field} value={f.colors} onChange={(e) => set("colors", e.target.value)} placeholder="e.g. Purple #8C00FF — or 'help me choose'" /></div>
          <div className="mt-4"><label className={labelCls}>Inspiration websites <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[80px] resize-y`} value={f.inspo} onChange={(e) => set("inspo", e.target.value)} placeholder="2–3 links and what you like" /></div>

          {/* ── Pages ── */}
          <Divider>Pages You Need</Divider>
          {/* Issue 1 fix: dynamic variables now correctly render */}
          <p className="mb-3 text-sm text-white/55">
            {selectedPkg
              ? `Your ${selectedPkg.name} plan includes up to ${selectedPkg.pages} pages. Extra pages are available as an add-on.`
              : "Select your package above to see your page allowance."}
          </p>
          <label className={labelCls}>Select pages <span className="text-brand-mint">*</span></label>
          <Pills options={PAGES} selected={f.pages} onToggle={togglePage} />

          <div className="mt-4"><label className={labelCls}>Homepage headline <span className="text-brand-mint">*</span></label><input className={field} value={f.headline} onChange={(e) => set("headline", e.target.value)} placeholder="First thing visitors read" /></div>
          <div className="mt-4"><label className={labelCls}>About your business <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[90px] resize-y`} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="What you do, mission, story..." /></div>
          <div className="mt-4"><label className={labelCls}>Services — List your services with details <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[90px] resize-y`} value={f.servicesList} onChange={(e) => set("servicesList", e.target.value)} placeholder="e.g. Web Design — $500, Consulting — $100/hr..." /></div>
          <div className="mt-4"><label className={labelCls}>Contact Page — What contact details should be shown? <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[70px] resize-y`} value={f.contactPageInfo} onChange={(e) => set("contactPageInfo", e.target.value)} placeholder="Phone, email, address, hours to display on site..." /></div>
          <div className="mt-4"><label className={labelCls}>Do you have pricing details to show? <span className="text-brand-mint">*</span></label><Select value={f.hasPricing} onChange={(v) => set("hasPricing", v)} placeholder="Select" options={["Yes — display prices", "No — contact for pricing", "Starting price range only"]} /></div>
          {f.hasPricing === "Yes — display prices" || f.hasPricing === "Starting price range only" ? (
            <div className="mt-4"><label className={labelCls}>If yes, please provide the pricing details <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[80px] resize-y`} value={f.pricingDetails} onChange={(e) => set("pricingDetails", e.target.value)} placeholder="List your prices or price ranges..." /></div>
          ) : null}
          <div className="mt-4"><label className={labelCls}>Products / Pricing — Provide product information and pricing</label><textarea className={`${field} min-h-[80px] resize-y`} value={f.pricingDetails} onChange={(e) => set("pricingDetails", e.target.value)} placeholder="Products with descriptions and prices..." /></div>
          <div className="mt-4"><label className={labelCls}>Any special offers or packages to include? <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[70px] resize-y`} value={f.specialOffers} onChange={(e) => set("specialOffers", e.target.value)} placeholder="e.g. Buy 2 get 1 free, seasonal discounts..." /></div>
          <div className="mt-4"><label className={labelCls}>Notes / file details <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[70px] resize-y`} value={f.fileDetails} onChange={(e) => set("fileDetails", e.target.value)} placeholder="Notes about any files, images, documents you will provide..." /></div>
          <div className="mt-4"><label className={labelCls}>Anything else? <span className="text-brand-mint">*</span></label><textarea className={`${field} min-h-[80px] resize-y`} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Deadlines, special requests..." /></div>

          {status === "error" && <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-base text-red-300">{err}</p>}

          {/* Project Timeline Note */}
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 text-sm leading-relaxed text-white/70">
            <p className="font-semibold text-amber-300">⚠️ Project Timeline Note</p>
            <p className="mt-2">Your website will be completed within <strong className="text-white">10–15 business days</strong> once we receive all required content and approvals.</p>
            <p className="mt-2">To help us keep your project moving smoothly, please share your content such as text, images, logo, and business details as early as possible. We may also reach out during the process for quick feedback or approvals. If required content or feedback is delayed, the project timeline may be extended. Project slots are reserved for <strong className="text-white">10–15 days</strong>, and if the timeline needs to be extended to <strong className="text-white">25–30 days</strong>, a small <strong className="text-white">$10 extension fee</strong> may apply.</p>
            <p className="mt-2">Thank you for helping us keep everything on track and delivered on time.</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <span className="text-sm text-white/45">🔒 Your information is secure and only used for your project.</span>
            <button onClick={submit} disabled={status === "sending"}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-mint px-8 py-4 text-base font-bold text-ink shadow-glow-mint transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 sm:w-auto">
              <Send size={18} /> {status === "sending" ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}