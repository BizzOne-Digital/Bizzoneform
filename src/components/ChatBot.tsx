"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, RotateCcw, ChevronRight } from "lucide-react";

interface Msg { from: "bot" | "user"; text: string }
interface Option { label: string; next: string }
interface Node { text: string; options: Option[] }

const FLOW: Record<string, Node> = {
  start: {
    text: "Hi! 👋 Welcome to BizzOne Digital. What would you like to know?",
    options: [
      { label: "📦 Packages & Pricing", next: "packages" },
      { label: "⏱ Turnaround Time", next: "turnaround" },
      { label: "🛡 Money-Back Guarantee", next: "guarantee" },
      { label: "🔧 Add-Ons & Extras", next: "addons" },
      { label: "⚡ How It Works", next: "process" },
      { label: "📍 About BizzOne", next: "about" },
    ],
  },

  packages: {
    text: "We offer three website packages — all are one-time payments with no monthly fees:\n\n⭐ Standard — $79 (one-time)\n• Up to 5 pages\n• Mobile responsive\n• SEO optimised from day one\n• Contact form to your email\n• Free hosting for 1 year\n• Custom coded — no templates\n\n🚀 Premium — $149 (one-time)\n• Up to 7 pages\n• Full admin portal\n• Gallery management\n• Blog / CMS ready\n• Free hosting for 1 year\n\n🏆 Advanced — $299 (one-time)\n• Up to 10 pages\n• Admin & customer portal\n• eCommerce ready (up to 50 products)\n• Payment system\n• Advanced SEO setup\n• Free hosting for 1 year\n\nAll include 24–48hr delivery and a 30-day money-back guarantee.",
    options: [
      { label: "What's the difference?", next: "pkg-diff" },
      { label: "⏱ How long does it take?", next: "turnaround" },
      { label: "🛡 Money-back guarantee", next: "guarantee" },
      { label: "🔧 Add-ons available?", next: "addons" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  "pkg-diff": {
    text: "Here's the key difference:\n\n📄 Standard ($79) — Up to 5 pages, static site. Perfect for small businesses who need a clean, professional online presence. No self-editing — our team handles updates.\n\n🖼 Premium ($149) — Up to 7 pages with a full admin portal so you can manage content and images yourself, plus gallery management and blog/CMS.\n\n🛒 Advanced ($299) — Up to 10 pages with admin & customer portals, eCommerce (up to 50 products), payment system, and advanced SEO setup.\n\nAll are one-time payments — no monthly platform fees, no ongoing costs (just hosting renewal after year 1).",
    options: [
      { label: "📦 See full packages", next: "packages" },
      { label: "🔧 What add-ons are available?", next: "addons" },
      { label: "💰 After year 1 costs?", next: "renewal" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  turnaround: {
    text: "⏱ Turnaround time: 24 to 48 hours.\n\nOnce you submit the onboarding form, our team gets started immediately. Your site is ready for review within 24–48 hours.\n\nHere's the flow:\n1. Payment confirmed ✅\n2. Onboarding form submitted ✅\n3. We build your site (24–48 hrs)\n4. We send you a preview to review\n5. Revisions sorted — then we go live!",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "⚡ Full process", next: "process" },
      { label: "🛡 Money-back guarantee", next: "guarantee" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  guarantee: {
    text: "🛡 30-Day Money-Back Guarantee.\n\nIf you are not satisfied with the final website — for any reason — you get a full refund. No questions asked.\n\nZero risk on your end. We stand behind our work completely.",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "⏱ How fast is delivery?", next: "turnaround" },
      { label: "⚡ How it works", next: "process" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  addons: {
    text: "🔧 Available Add-Ons:\n\n🎨 Logo Design\n• Simple logo — $20\n• Custom logo (with print files: AI, EPS, SVG, PDF) — $34.99\n\n🌐 Domain\n• We purchase & set up your domain — $25\n\n🔒 Monthly Maintenance (after year 1)\n• Hosting + minor changes — $30/month\n\n📊 SEO Service\n• Keywords, Search Console, local SEO, Google Business — $199/month\n\n📱 Social Media Management\n• 4 posts + 2 AI videos/month (IG, FB, TikTok, GBP) — $299/month\n\nAll add-ons are quoted separately — you won't be charged without approval.",
    options: [
      { label: "💰 After year 1 costs?", next: "renewal" },
      { label: "📦 See website packages", next: "packages" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  renewal: {
    text: "💰 After Year 1 Costs:\n\nHosting renewal — $30–$40/year\nDomain renewal — $25/year\n\nBoth are billed separately, and we handle everything for you. You'll be notified before renewal so there's no surprise charges.\n\nEverything else — the site, the code, the design — is yours forever. One-time payment, no ongoing platform fees.",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "🔧 Other add-ons", next: "addons" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  process: {
    text: "⚡ Here's how it works:\n\n1️⃣ You make the payment to lock in your spot\n2️⃣ Fill out our quick onboarding form (5 min)\n3️⃣ Our team starts building straight away\n4️⃣ Your site is ready in 24–48 hours\n5️⃣ We send a preview — request any changes\n6️⃣ Once you're happy, we connect your domain and hand over full access\n\n🛡 30-day money-back guarantee if you're not satisfied.",
    options: [
      { label: "⏱ Turnaround time?", next: "turnaround" },
      { label: "📦 See packages", next: "packages" },
      { label: "🛡 Money-back guarantee", next: "guarantee" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  about: {
    text: "📍 BizzOne Digital\n\nBased at 55 Village Centre Pl, Mississauga, Ontario.\nPhone / WhatsApp: +1 (289) 412-1562\n\nWe serve all of Canada and internationally — everything is handled online.\n\n🌟 What we do:\n• Website Design & Development\n• Paid Advertising (Meta Ads, Google Ads)\n• Design & Branding\n• Content Creation (Video, Reels)\n• Content Strategy\n• Social Media Management\n• SEO\n• AI Automation",
    options: [
      { label: "📦 Website packages", next: "packages" },
      { label: "⚡ How it works", next: "process" },
      { label: "💬 Contact us", next: "contact" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },

  contact: {
    text: "📞 Reach us directly:\n\n📱 WhatsApp / Call: +1 (289) 412-1562\n📍 55 Village Centre Pl, Mississauga ON\n\nOr fill out the form on this page and our team will get back to you within 24–48 hours. We reply to every inbound message — usually within 5 minutes.",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "⚡ How it works", next: "process" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: FLOW.start.text }]);
  const [node, setNode] = useState("start");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const pick = (label: string, next: string) => {
    const n = FLOW[next];
    if (!n) return;
    setMsgs((p) => [...p, { from: "user", text: label }, { from: "bot", text: n.text }]);
    setNode(next);
  };

  const reset = () => {
    setMsgs([{ from: "bot", text: FLOW.start.text }]);
    setNode("start");
  };

  const current = FLOW[node];

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f1a] shadow-2xl sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 bg-brand-purple/20 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-mint/20 text-brand-mint">
                <MessageCircle size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">BizzOne Assistant</div>
                <div className="flex items-center gap-1 text-[10px] text-brand-mint/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-mint" /> Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} title="Restart" className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                <RotateCcw size={13} />
              </button>
              <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex max-h-[380px] min-h-[220px] flex-col gap-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-sm bg-brand-mint/20 text-white" : "rounded-bl-sm bg-white/[0.06] text-white/85"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Options */}
          {current && (
            <div className="border-t border-white/8 p-3">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Select an option</p>
              <div className="flex flex-col gap-1.5">
                {current.options.map((opt) => (
                  <button key={opt.label} onClick={() => pick(opt.label, opt.next)}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-left text-sm font-medium text-white/80 transition-all hover:border-brand-mint/40 hover:bg-brand-mint/5 hover:text-white">
                    {opt.label}
                    <ChevronRight size={14} className="shrink-0 text-white/30" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple shadow-[0_4px_24px_rgba(140,0,255,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(140,0,255,0.65)] sm:right-6"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-mint text-[9px] font-bold text-ink">
            ?
          </span>
        )}
      </button>
    </>
  );
}