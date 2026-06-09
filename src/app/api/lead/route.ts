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
    const service = String(d.service || "General inquiry").trim();
    const message = String(d.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please fill in your name, email and message." }, { status: 400 });
    }

    const results: string[] = [];

    // 1) GoHighLevel webhook
    try {
      const ghlRes = await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, business, service, message }),
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
        const v = (x: string) => x || "—";
        const desc =
`## New Lead from Website
**Name:** ${v(name)}
**Email:** ${v(email)}
**Phone:** ${v(phone)}
**Business:** ${v(business)}
**Service:** ${v(service)}

**Message:**
${v(message)}

---
*Submitted via BizzOne Digital lead form*`;

        const cuRes = await fetch(`https://api.clickup.com/api/v2/list/${LIST}/task`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: TOKEN },
          body: JSON.stringify({
            name: `${name}${business ? ` — ${business}` : ""} | ${service}`,
            markdown_description: desc,
            status: process.env.CLICKUP_STATUS || "not started",
            tags: ["lead", "website"],
          }),
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
