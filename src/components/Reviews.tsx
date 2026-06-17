"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEWS = [
  { name: "Brinda Mani", time: "2 weeks ago", stars: 5, text: "We had an amazing experience working with the team who built our website. They were professional, patient, creative, and truly understood our vision from start to finish. The website looks beautiful, is easy to navigate, and perfectly represents our brand." },
  { name: "Rupesh Patel", time: "3 weeks ago", stars: 5, text: "I worked with them for my website, and they did an amazing job. They were very cooperative, attentive to detail, and professional throughout the entire process. I'm very satisfied with the final result and would highly recommend them to anyone looking for website design services." },
  { name: "3Ray Mobiles", time: "1 month ago", stars: 5, text: "BizzOne Digital did an amazing job on my website. I'm really impressed with how quickly they completed everything while maintaining excellent quality. The site looks modern and professional. Communication was smooth throughout. Definitely recommend them!" },
  { name: "infoglobal pardon", time: "1 month ago", stars: 5, text: "I want to say a huge thank you to the BizzOne team for creating an amazing website for my company. From start to finish, they were professional, responsive, and communicated with me every step of the way. They brought my vision to life and the process was smooth and stress-free." },
  { name: "Jaydeep M", time: "1 week ago", stars: 5, text: "Had the best experience — for getting my website done! Understood the requirements without a fuss. Response time was great and the team was very friendly and helpful throughout." },
  { name: "Manu Sharma", time: "1 week ago", stars: 5, text: "We had an excellent experience working with the team on our website development project. They met our expectations and the collaboration was smooth from start to finish." },
  { name: "Dollar Customs", time: "7 months ago", stars: 5, text: "We started with BizzOne Digital from absolute scratch — they created our logo, built our website, handled our social media, videography, and video editing — literally everything from start to finish. The results have been incredible." },
  { name: "Lance Colins", time: "1 week ago", stars: 5, text: "I would like to thank BizzOne for their patience with me. They have done a beautiful job on my website in such a short period of time — nothing but amazing. If anyone is looking for a website, you no longer have to look. BizzOne is the one." },
  { name: "Mohamed Iye", time: "3 weeks ago", stars: 5, text: "Top-notch service and very professional! The team was reliable, efficient, and delivered excellent quality work. Great communication and attention to detail. Highly recommend BizzOne Digital for anyone looking for professional digital services!" },
  { name: "FairSafe", time: "4 weeks ago", stars: 5, text: "I would give 10 stars if I can. I was a bit skeptical at first but honestly after seeing the results — a clean, modern, and professional site — they completely exceeded my expectations." },
  { name: "Gams Gakou", time: "1 month ago", stars: 5, text: "I had a great experience working with BizzOne Digital. They helped me build my website, and the whole process was smooth and professional. Their team was responsive, patient, and really understood what I wanted." },
  { name: "Lupin Project", time: "1 month ago", stars: 5, text: "I'd like to thank the BizzOne team for creating an amazing website and ad campaign for our company. They communicated with me every step of the way, making the entire process smooth and stress-free. Extremely happy with the results." },
  { name: "Kevin Pearce", time: "1 month ago", stars: 5, text: "Great communication. Fast results and service. I would recommend this company to anyone." },
  { name: "Wavy", time: "2 months ago", stars: 5, text: "Great experience working with BizzOne. They helped me set up key parts of my WAVY business and made the process much easier. The team is great — the service and relationship building they do is the best." },
  { name: "JMG Auto", time: "6 months ago", stars: 5, text: "I started working with them for Google Ads and honestly wasn't expecting anything special. I assumed it would be like every other digital marketing company, but they proved me wrong. Their setup is genuinely an all-in-one service." },
  { name: "Micky", time: "1 month ago", stars: 5, text: "Very professional." },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < n ? "fill-amber-400 text-amber-400" : "text-white/20"} />
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-brand-purple/60", "bg-brand-mint/20", "bg-blue-500/40", "bg-rose-500/40", "bg-amber-500/40"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${color} text-sm font-bold text-white`}>
      {initials}
    </div>
  );
}

const VISIBLE = 3;

export default function Reviews() {
  const [start, setStart] = useState(0);
  const [dir, setDir] = useState(1);
  const total = REVIEWS.length;

  const go = (d: number) => {
    setDir(d);
    setStart((p) => (p + d * VISIBLE + total) % total);
  };

  useEffect(() => {
    const id = setInterval(() => go(1), 4000);
    return () => clearInterval(id);
  }, []);

  const visible = Array.from({ length: VISIBLE }, (_, i) => REVIEWS[(start + i) % total]);

  return (
    <section className="relative py-16 sm:py-20">
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-brand-mint/8 blur-[120px]" />
      <div className="section">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full neon-border px-5 py-2 text-xs font-bold uppercase tracking-[0.22em]">
            <span className="text-brand-purple-light">Client</span><span className="text-brand-mint">Reviews</span>
          </span>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            What Our Clients <span className="text-gradient">Say</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Stars n={5} />
            <span className="text-sm text-white/60"><strong className="text-white">5.0</strong> · {total} Google Reviews</span>
            <span className="text-xs font-bold text-[#4285F4]">G</span>
          </div>
        </div>

        {/* Cards */}
        <div className="relative mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={start}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((r, i) => (
                <div key={i} className="glass flex flex-col gap-4 rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} />
                    <div>
                      <div className="text-sm font-bold text-white">{r.name}</div>
                      <div className="text-xs text-white/45">{r.time}</div>
                    </div>
                  </div>
                  <Stars n={r.stars} />
                  <p className="flex-1 text-sm leading-relaxed text-white/70">&ldquo;{r.text}&rdquo;</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full glass text-white/60 transition hover:text-brand-mint">
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs text-white/40">{Math.floor(start / VISIBLE) + 1} / {Math.ceil(total / VISIBLE)}</span>
            <button onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full glass text-white/60 transition hover:text-brand-mint">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}