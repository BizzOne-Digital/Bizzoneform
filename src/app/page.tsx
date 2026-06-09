import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import Reviews from "@/components/Reviews";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="BizzOne Digital" width={34} height={34} className="rounded-lg" />
            <span className="text-base font-bold tracking-tight text-white">BizzOne<span className="text-brand-mint"> Digital</span></span>
          </a>
          <a href="https://bizzonedigital.com" target="_blank" rel="noreferrer" className="hidden rounded-full neon-border px-5 py-2 text-xs font-bold text-white transition-all hover:shadow-glow-purple sm:inline-block">
            Visit Main Site
          </a>
        </div>
      </header>

      <main className="relative pt-24">
        {/* Hero + Form */}
        <section className="relative py-12 sm:py-16">
          <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-brand-purple/20 blur-[130px]" />
          <div className="section">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full neon-border px-5 py-2 text-xs font-bold uppercase tracking-[0.22em]">
                <span className="text-brand-purple-light">Get</span><span className="text-brand-mint">Started</span>
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Let&apos;s Grow Your Business <span className="text-gradient">Together</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/55">
                Tell us what you need — pick a service, fill in your details, and our team will reach out within <span className="font-semibold text-white">24–48 hours</span>.
              </p>
            </div>
            <LeadForm />
          </div>
        </section>

        {/* Reviews */}
        <Reviews />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="section text-center">
          <a href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="BizzOne Digital" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-bold text-white">BizzOne<span className="text-brand-mint"> Digital</span></span>
          </a>
          <p className="mt-3 text-xs text-white/35">&copy; {new Date().getFullYear()} BizzOne Digital. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
