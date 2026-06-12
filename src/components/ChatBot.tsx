"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot, RotateCcw } from "lucide-react";

interface Msg { from: "bot" | "user"; text: string }
interface Node { text: string; options: { label: string; next: string }[] }

const FLOW: Record<string, Node> = {
  start: {
    text: "Hi! 👋 Welcome to BizzOne Digital. How can I help you today?",
    options: [
      { label: "📦 Packages & Pricing", next: "packages" },
      { label: "⚡ How It Works", next: "process" },
      { label: "🔧 Add-Ons & Extras", next: "addons" },
      { label: "💳 Payment Policy", next: "payment" },
      { label: "📍 About BizzOne", next: "about" },
      { label: "💬 Talk to Our Team", next: "contact" },
    ],
  },
  packages: {
    text: "We offer two website packages:\n\n⭐ Starter — $79 (one-time)\n• Up to 5 pages\n• Contact form\n• Mobile responsive\n• Stock photos\n• Basic on-page SEO\n\n🚀 Standard — $149 (one-time)\n• Up to 7 pages\n• Contact form + Admin portal\n• Gallery management\n• Mobile responsive\n• Blog / CMS ready\n\nBoth include professional design and 24–48 hour turnaround.",
    options: [
      { label: "What's the difference?", next: "pkg-diff" },
      { label: "What are add-ons?", next: "addons" },
      { label: "💳 Payment policy", next: "payment" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  "pkg-diff": {
    text: "Starter ($79) is perfect if you need a clean, simple website — up to 5 pages with essential features.\n\nStandard ($149) is better if you need more pages (up to 7), an admin portal to manage your content, gallery management, and blog/CMS functionality.\n\nBoth packages can be upgraded with add-ons like logo design, eCommerce, booking system, and more.",
    options: [
      { label: "🔧 See add-ons", next: "addons" },
      { label: "⚡ How it works", next: "process" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  process: {
    text: "Here's how it works — super simple:\n\n1️⃣ Submit — Fill out the form on this page (5 min)\n2️⃣ Build — We design & develop your site (24–48 hrs)\n3️⃣ Review — You review and request changes (same day)\n4️⃣ Pay — Pay only after you're happy (secure link)\n5️⃣ Live — Your website goes live (within hours)\n\n✅ No upfront payment required!",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "💳 Payment policy", next: "payment" },
      { label: "How long does it take?", next: "timeline" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  timeline: {
    text: "From form submission to a live website:\n\n• We start building within 24–48 hours\n• First draft ready for review same day\n• Revisions usually take a few hours\n• Site goes live within hours of approval\n\nMost clients have a live website within 2–3 business days!",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "⚡ Full process", next: "process" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  addons: {
    text: "Add-ons let you extend your package. Each is quoted separately:\n\n🎨 Logo Design\n🌐 Domain Purchase & Setup\n📄 Extra Pages\n👤 Admin Portal\n👥 Customer Portal\n💳 Payment Integration\n🛒 eCommerce / Online Store\n📅 Online Booking System\n📧 Email Newsletter\n🔗 CRM Integration\n🌍 Multi-Language\n✨ Fully Custom Design\n\nJust select what you need in the form — we'll include it in your quote.",
    options: [
      { label: "📦 See packages", next: "packages" },
      { label: "💳 Payment policy", next: "payment" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  payment: {
    text: "💰 You only pay AFTER you are satisfied with your design.\n\nNo upfront payment is needed to submit this form. Here's how it works:\n\n1. Submit the form — free\n2. We build your website — free\n3. You review and approve — free\n4. Pay via secure link — only when happy\n\nNo risk, no commitment. If you're not happy, you don't pay.",
    options: [
      { label: "⚡ How it works", next: "process" },
      { label: "📦 See packages", next: "packages" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  about: {
    text: "📍 BizzOne Digital is an AI Automation & Digital Growth Agency based in Mississauga, Ontario.\n\nWe serve businesses across Canada and the United States.\n\n🌟 Our services:\n• Paid Advertising (Meta, Google, TikTok)\n• Design & Branding\n• Content Creation (Video, Reels)\n• Content Strategy\n• Social Media Management\n• Website Design & Development\n• AI Automation\n\n500+ businesses trust us to grow smarter and faster.",
    options: [
      { label: "📦 Website packages", next: "packages" },
      { label: "⚡ How it works", next: "process" },
      { label: "💬 Talk to team", next: "contact" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
  contact: {
    text: "The fastest way to reach us is by filling out the form on this page! 📝\n\nOur team will review your details and reach out within 24–48 hours.\n\nYou can also visit our main website: bizzonedigital.com",
    options: [
      { label: "📦 See packages first", next: "packages" },
      { label: "⚡ How it works", next: "process" },
      { label: "⬅ Main menu", next: "start" },
    ],
  },
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: FLOW.start.text }]);
  const [currentNode, setCurrentNode] = useState("start");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const pick = (label: string, next: string) => {
    const node = FLOW[next];
    if (!node) return;
    setMsgs((p) => [...p, { from: "user", text: label }, { from: "bot", text: node.text }]);
    setCurrentNode(next);
  };

  const reset = () => {
    setMsgs([{ from: "bot", text: FLOW.start.text }]);
    setCurrentNode("start");
  };

  const node = FLOW[currentNode];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 left-4 z-50 flex w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f1a] shadow-2xl sm:left-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/8 bg-brand-purple/20 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Bot size={20} className="text-brand-mint" />
              <div>
                <div className="text-sm font-bold text-white">BizzOne Assistant</div>
                <div className="flex items-center gap-1 text-[10px] text-brand-mint/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" /> Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} title="Restart" className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white">
                <RotateCcw size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex max-h-[400px] min-h-[280px] flex-col gap-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-md bg-brand-mint/20 text-white" : "rounded-bl-md bg-white/5 text-white/85"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Options */}
          {node && (
            <div className="flex flex-wrap gap-2 border-t border-white/8 p-3">
              {node.options.map((opt) => (
                <button key={opt.label} onClick={() => pick(opt.label, opt.next)}
                  className="rounded-full border border-brand-mint/30 bg-brand-mint/5 px-3.5 py-2 text-xs font-semibold text-brand-mint transition-all hover:bg-brand-mint/15">
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand-purple shadow-[0_4px_24px_rgba(140,0,255,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_6px_32px_rgba(140,0,255,0.65)] sm:left-6"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </>
  );
}