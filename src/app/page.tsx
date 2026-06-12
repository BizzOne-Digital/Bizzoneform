"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import Reviews from "@/components/Reviews";
import LeadForm from "@/components/LeadForm";
import ChatBot from "@/components/ChatBot";

/* ── portfolio data ── */
const PROJECTS = [
  { name: "M2M Pro", cat: "Business Platform", url: "https://www.m2mprocleaners.ca" },
  { name: "Cobb Church", cat: "Community", url: "https://www.cobbchurchnetwork.org" },
  { name: "A1 Furnished", cat: "Real Estate", url: "https://www.a1furnished.ca" },
  { name: "Global Paradon", cat: "Corporate", url: "https://www.globalpardonwaivers.com" },
  { name: "AEM Quality ISO", cat: "Certification", url: "https://www.aemqualityiso.com" },
  { name: "Bariis Pizza", cat: "Restaurant", url: "https://www.bariishalalpizza.com" },
  { name: "Corner Store", cat: "Retail", url: "https://www.cornerstoreatlinwood.com" },
  { name: "Toronto Notary", cat: "Local Business", url: "https://www.torontonotaryoffice.ca" },
];
const BASE_W = 1440;

function MiniFrame({ url, name }: { url: string; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / BASE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0814] shadow-2xl">
      <div className="flex items-center gap-1 border-b border-white/5 px-2.5 py-1.5">
        <span className="h-2 w-2 rounded-full bg-red-400/70" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
        <span className="h-2 w-2 rounded-full bg-green-400/70" />
        <span className="ml-2 hidden truncate text-[9px] text-white/30 sm:block">{url.replace("https://www.", "")}</span>
      </div>
      <div ref={ref} className="relative aspect-[16/10] w-full overflow-hidden bg-[#05030a]">
        <iframe src={url} title={name} loading="lazy" scrolling="no"
          className="absolute left-0 top-0 origin-top-left border-0"
          style={{ width: `${BASE_W}px`, height: `${BASE_W * (10 / 16)}px`, transform: `scale(${scale})`, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = PROJECTS.length;
  const go = (dir: number) => setActive((a) => (a + dir + n) % n);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 3500);
    return () => clearInterval(id);
  }, [paused, n]);

  const cur = PROJECTS[active];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="BizzOne Digital" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight text-white">BizzOne<span className="text-brand-mint"> Digital</span></span>
          </a>
          <a href="https://bizzonedigital.com" target="_blank" rel="noreferrer" className="hidden rounded-full border border-brand-mint/40 bg-brand-mint/10 px-5 py-2.5 text-sm font-bold text-brand-mint transition-all hover:bg-brand-mint/20 sm:inline-block">
            Visit Main Site
          </a>
        </div>
      </header>

      <main className="relative pt-24 overflow-x-hidden">
        {/* ── Hero: text left + portfolio right ── */}
        <section className="relative py-10 sm:py-14">
          <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-brand-purple/20 blur-[130px]" />
          <div className="section grid items-center gap-8 lg:grid-cols-2">
            {/* Left */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-mint/30 bg-brand-mint/10 px-5 py-2 text-sm font-bold uppercase tracking-[0.18em] text-brand-mint">
                Get Started
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Let&apos;s Build Your <span className="text-brand-mint">Website</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                Choose your package, tell us about your project, and our team will get started within <span className="font-bold text-white">24–48 hours</span>.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-base text-white/70">
                  <MapPin size={18} className="text-brand-mint" />
                  <span>Based in <strong className="text-white">Mississauga, Ontario</strong></span>
                </div>
              </div>
              <p className="mt-2 text-base text-white/60">Trusted by businesses across <strong className="text-white">Canada</strong> and the <strong className="text-white">United States</strong>.</p>
            </div>

            {/* Right: portfolio slider */}
            <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                  <MiniFrame url={cur.url} name={cur.name} />
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mint">{cur.cat}</span>
                  <h3 className="text-sm font-bold text-white">{cur.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a href={cur.url} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-full glass text-white/60 hover:text-brand-mint"><ExternalLink size={13} /></a>
                  <button onClick={() => go(-1)} className="grid h-8 w-8 place-items-center rounded-full glass text-white/60 hover:text-brand-mint"><ChevronLeft size={14} /></button>
                  <button onClick={() => go(1)} className="grid h-8 w-8 place-items-center rounded-full glass text-white/60 hover:text-brand-mint"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="mt-2 flex gap-1.5">
                {PROJECTS.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-brand-mint" : "w-1.5 bg-white/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Reviews />
        <LeadForm />
      </main>

      <footer className="border-t border-white/8 py-10">
        <div className="section text-center">
          <a href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="BizzOne Digital" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-bold text-white">BizzOne<span className="text-brand-mint"> Digital</span></span>
          </a>
          <p className="mt-3 text-sm text-white/40">&copy; {new Date().getFullYear()} BizzOne Digital. All rights reserved.</p>
        </div>
      </footer>

      <ChatBot />
    </>
  );
}