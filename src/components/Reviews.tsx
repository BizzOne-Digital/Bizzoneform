"use client";

import { useEffect, useRef } from "react";

const TRUSTINDEX_SRC = "https://cdn.trustindex.io/loader.js?d9f3a0e73ef363416236d7fa18d";

export default function Reviews() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = TRUSTINDEX_SRC;
    script.defer = true;
    script.async = true;
    ref.current.appendChild(script);
  }, []);

  return (
    <section className="relative py-16 sm:py-20">
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-brand-mint/8 blur-[120px]" />
      <div className="section">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full neon-border px-5 py-2 text-xs font-bold uppercase tracking-[0.22em]">
            <span className="text-brand-purple-light">Client</span><span className="text-brand-mint">Reviews</span>
          </span>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            What Our Clients <span className="text-gradient">Say</span>
          </h2>
        </div>
        {/* Trustindex widget renders inside this div */}
        <div ref={ref} className="mx-auto mt-10 max-w-5xl" />
      </div>
    </section>
  );
}