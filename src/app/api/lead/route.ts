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

    // 1) GoHighLevel webhook — send everything
    try {
      const ghlRes = await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, business,
          address: v(d.address), website: v(d.site), social: v(d.social),
          service: v(d.service), priority: v(d.priority), launch: v(d.launch),
          goal: v(d.goal), audience: v(d.audience), usp: v(d.usp),
          logo: v(d.logo), colors: v(d.colors), style: v(d.style), inspiration: v(d.inspo),
          pages: list(d.pages), headline: v(d.headline), about: v(d.about),
          services_products: v(d.services), pricing: v(d.pricing),
          domain: v(d.domain), hosting: v(d.hosting), features: list(d.features), notes: v(d.notes),
        }),
      });
      results.push(ghlRes.ok ? "GHL: ok" : `GHL: ${ghlRes.status}`);
    } catch (e) {
      results.push("GHL: failed");
      console.error("GHL webhook error:", e);
    }

    // 2) ClickUp task (if configured)
    const TOKEN = (process.env.CLICKUP_TOKEN || "").trim();
    const LIST = (process.env.CLICKUP_LIST_ID || "").trim();

    if (TOKEN && LIST) {
      try {
        const desc =
`## 📋 Contact & Project
**Business:** ${v(business)}
**Contact:** ${v(name)} | ${v(email)} | ${v(phone)}
**Address:** ${v(d.address)}
**Current Website:** ${v(d.site)}
**Social:** ${v(d.social)}
**Service:** ${v(d.service)}
**Priority:** ${v(d.priority)}
**Expected Timeline:** ${v(d.launch)}
**Goal:** ${v(d.goal)}
**Audience:** ${v(d.audience)}
**Difference:** ${v(d.usp)}

## 🎨 Brand & Design
**Logo:** ${v(d.logo)}
**Brand Colours:** ${v(d.colors)}
**Design Style:** ${v(d.style)}
**Inspiration:** ${v(d.inspo)}

## 📝 Content
**Pages:** ${list(d.pages)}
**Headline:** ${v(d.headline)}
**About:** ${v(d.about)}
**Services / Products:** ${v(d.services)}
**Display Pricing:** ${v(d.pricing)}

## 🔧 Technical
**Domain:** ${v(d.domain)}
**Hosting:** ${v(d.hosting)}
**Features:** ${list(d.features)}
**Notes:** ${v(d.notes)}

---
*Submitted via BizzOne Digital lead form*`;

        const prio = String(d.priority || "").toLowerCase();
        const priority = prio.startsWith("urgent") ? 1 : prio.startsWith("high") ? 2 : prio.startsWith("low") ? 4 : 3;

        const body: Record<string, unknown> = {
          name: `${business} — ${name} | ${v(d.service)}`,
          markdown_description: desc,
          priority,
          status: process.env.CLICKUP_STATUS || "not started",
          tags: ["lead", "website"],
        };
        if (d.launch && !Number.isNaN(Date.parse(String(d.launch)))) body.due_date = Date.parse(String(d.launch));

        const cuRes = await fetch(`https://api.clickup.com/api/v2/list/${LIST}/task`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: TOKEN },
          body: JSON.stringify(body),
        });
        const cuData = await cuRes.json().catch(() => ({}));
        results.push(cuRes.ok ? "ClickUp: ok" : `ClickUp: ${cuRes.status} ${JSON.stringify(cuData)}`);
      } catch (e) {
        results.push("ClickUp: failed");
        console.error("ClickUp error:", e);
      }
    } else {
      results.push("ClickUp: skipped (not configured)");
    }

    console.log("Lead submitted:", results.join(" | "));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead route error:", err);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}