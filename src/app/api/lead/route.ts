import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GHL_WEBHOOK = "https://services.leadconnectorhq.com/hooks/gSKYbmYEz3uDdVAuThaS/webhook-trigger/a57cd9da-341a-401c-9675-237c53c620be";

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

    const v = (x: unknown): string => { const s = String(x ?? "").trim(); return s || "—"; };
    const list = (a: unknown): string => (Array.isArray(a) && a.length ? a.join(", ") : "None");
    const results: string[] = [];

    // Split name for GHL
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || "";

    // 1) GoHighLevel webhook — use GHL-standard field names
    try {
      const ghlPayload = {
        // GHL standard contact fields
        firstName,
        lastName,
        name,
        email,
        phone,
        companyName: business,
        source: "BizzOne Digital Website",

        // Custom data
        full_name: name,
        business_name: business,
        package_selected: v(d.package),
        addons: list(d.addons),
        website: v(d.site),
        social: v(d.social),
        service: v(d.service),
        goal: v(d.goal),
        audience: v(d.audience),
        logo: v(d.logo),
        colors: v(d.colors),
        style: v(d.style),
        inspiration: v(d.inspo),
        pages: list(d.pages),
        headline: v(d.headline),
        about: v(d.about),
        notes: v(d.notes),
      };

      console.log("GHL payload:", JSON.stringify(ghlPayload, null, 2));

      const ghlRes = await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ghlPayload),
      });

      const ghlBody = await ghlRes.text().catch(() => "");
      console.log(`GHL response: ${ghlRes.status} ${ghlRes.statusText} — ${ghlBody}`);
      results.push(ghlRes.ok ? "GHL: ok" : `GHL: ${ghlRes.status} ${ghlBody}`);
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

    console.log("Lead submitted:", results.join(" | "));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead error:", err);
    return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
  }
}