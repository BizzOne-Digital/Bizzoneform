"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw]         = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (!pw) return;
    setLoading(true); setErr("");
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setErr("Incorrect password.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05060A] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#8C00FF,#C8F31D)" }}>
            <span className="text-2xl font-black text-black">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white">BizzOne Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Internal use only</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6">
          <label className="mb-2 block text-sm font-medium text-white/70">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#C8F31D]/50"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Enter dashboard password"
            autoFocus
          />
          {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[#C8F31D] py-3 text-sm font-bold text-black transition-all hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-white/25">BizzOne Digital · Internal Dashboard</p>
      </div>
    </div>
  );
}