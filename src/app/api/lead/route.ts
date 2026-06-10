import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GHL_WEBHOOK = "https://services.leadconnectorhq.com/hooks/gSKYbmYEz3uDdVAuThaS/webhook-trigger/4f551637-bbcb-47b1-89d9-09893c193f9f";

export async function POST(req: Request) {
  try {
    const d = await req.json();
    const name = String(d.name || "").trim();
    const email = String(d.email || "").trim();
    const phone = String(d.phone || "").trim();
    const business = String(d.business || "").trim();

    if (!name || !email || !business || !phone) {
      return NextResponse.json({ error: "Please fill in your business, name, email and phone." }, { status: 400 });
    }

    const v = (x: unknown) => (x && String(x).trim()) || "—";
    const list = (a: unknown) => (Array.isArray(a) && a.length ? a.join(", ") : "None");
    const results: string[] = [];

    // 1) GoHighLevel webhook
    try {
      const ghlRes = await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, business,
          package: v(d.package), addons: list(d.addons),
          website: v(d.site), social: v(d.social),
          service: v(d.service), goal: v(d.goal), audience: v(d.audience),
          logo: v(d.logo), colors: v(d.colors), style: v(d.style), inspiration: v(d.inspo),
          pages: list(d.pages), headline: v(d.headline), about: v(d.about), notes: v(d.notes),
        }),
      });
      results.push(ghlRes.ok ? "GHL: ok" : `GHL: ${ghlRes.status}`);
    } catch (e) {
      results.push("GHL: failed");
      console.error("GHL error:", e);
    }

    // 2) ClickUp task (if configured)
    const TOKEN = (process.env.CLICKUP_TOKEN || "").trim();
    const LIST = (process.env.CLICKUP_LIST_ID || "").trim();

    if (TOKEN && LIST) {
      try {
        const desc =
`## 💳 Package & Add-Ons
**Package:** ${v(d.package)}
**Add-Ons:** ${list(d.addons)}

## 📋 Contact
**Business:** ${v(business)}
**Contact:** ${v(name)} | ${v(email)} | ${v(phone)}
**Current Website:** ${v(d.site)}
**Social:** ${v(d.social)}

## 📝 Project
**Service:** ${v(d.service)}
**Goal:** ${v(d.goal)}
**Audience:** ${v(d.audience)}

## 🎨 Brand & Design
**Logo:** ${v(d.logo)}
**Brand Colours:** ${v(d.colors)}
**Design Style:** ${v(d.style)}
**Inspiration:** ${v(d.inspo)}

## 📄 Content
**Pages:** ${list(d.pages)}
**Headline:** ${v(d.headline)}
**About:** ${v(d.about)}
**Notes:** ${v(d.notes)}

---
*Submitted via BizzOne Digital lead form*`;

        const cuRes = await fetch(`https://api.clickup.com/api/v2/list/${LIST}/task`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: TOKEN },
          body: JSON.stringify({
            name: `${business} — ${name} | ${v(d.package)}`,
            markdown_description: desc,
            status: process.env.CLICKUP_STATUS || "not started",
            tags: ["lead", "website"],
          }),
        });
        const cuData = await cuRes.json().catch(() => ({}));
        results.push(cuRes.ok ? "ClickUp: ok" : `ClickUp: ${cuRes.status}`);
      } catch (e) {
        results.push("ClickUp: failed");
        console.error("ClickUp error:", e);
      }
    }

    console.log("Lead:", results.join(" | "));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead error:", err);
    return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
  }
}