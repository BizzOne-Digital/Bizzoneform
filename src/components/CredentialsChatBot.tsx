"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, RotateCcw, Send } from "lucide-react";

interface Msg { from: "bot" | "user"; text: string }

const WELCOME = "Hi! I'm here to help you complete the credentials form. Ask me how to find payment keys, create a Google App Password, or what domain credentials are.";

const SUGGESTED = [
  "How do I create a Google App Password?",
  "Where can I find my Stripe keys?",
  "What are domain credentials?",
  "Is it safe to share my normal email password?",
];

export default function CredentialsChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...msgs, { from: "user", text: trimmed }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/credentials/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })),
        }),
      });
      const data = await res.json();
      setMsgs([...next, { from: "bot", text: data.reply || "Sorry, I couldn't respond." }]);
    } catch {
      setMsgs([...next, { from: "bot", text: "Chat is temporarily unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F1A] shadow-2xl sm:right-6">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Help Assistant</p>
              <p className="text-[10px] text-brand-mint">Credentials form help</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setMsgs([{ from: "bot", text: WELCOME }])} className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:text-white"><RotateCcw size={13} /></button>
              <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg text-white/40 hover:text-white"><X size={15} /></button>
            </div>
          </div>
          <div className="flex max-h-[320px] min-h-[200px] flex-col gap-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-sm bg-brand-mint/20 text-white" : "rounded-bl-sm bg-white/[0.06] text-white/85"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-white/40">Thinking...</p>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-white/8 p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED.map(q => (
                <button key={q} type="button" onClick={() => send(q)}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50 hover:border-brand-mint/40 hover:text-white">{q}</button>
              ))}
            </div>
            <p className="text-[10px] text-white/35">Do not paste passwords or secret keys into this chat.</p>
            <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value.slice(0, 2000))} maxLength={2000}
                placeholder="Ask a question..." autoComplete="off"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-brand-mint/50" />
              <button type="submit" disabled={loading || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-xl bg-brand-purple text-white disabled:opacity-50">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple shadow-[0_4px_24px_rgba(140,0,255,0.5)] transition-all hover:-translate-y-1 sm:right-6">
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-mint text-[9px] font-bold text-ink">?</span>
        )}
      </button>
    </>
  );
}
