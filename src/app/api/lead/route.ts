import { NextResponse } from "next/server";
import { getSubmissions } from "@/lib/mongodb";

export const runtime = "nodejs";

const GHL_WEBHOOK = "https://services.leadconnectorhq.com/hooks/gSKYbmYEz3uDdVAuThaS/webhook-trigger/a57cd9da-341a-401c-9675-237c53c620be";

export async function POST(req: Request) {
  try {
    const d = await req.json();
    const name     = String(d.name     || "").trim();
    const email    = String(d.email    || "").trim();
    const phone    = String(d.phone    || "").trim();
    const business = String(d.business || "").trim();

    if (!name || !email || !business || !phone) {
      return NextResponse.json({ error: "Please fill in your business, name, email and phone." }, { status: 400 });
    }

    const v    = (x: unknown): string => { const s = String(x ?? "").trim(); return s || "—"; };
    const list = (a: unknown): string => Array.isArray(a) && a.length ? a.join(", ") : "None";

    // 1) Save to MongoDB
    try {
      const col = await getSubmissions();
      await col.insertOne({
        created_at:     new Date().toISOString(),
        business, name, email, phone,
        package:        v(d.package),
        addons:         list(d.addons),
        site:           v(d.site),
        social:         v(d.social),
        goal:           v(d.goal),
        audience:       v(d.audience),
        logo:           v(d.logo),
        logo_url:       String(d.logo_url || "").trim(),
        colors:         v(d.colors),
        style:          v(d.style),
        inspo:          v(d.inspo),
        pages:          list(d.pages),
        headline:       v(d.headline),
        about:          v(d.about),
        services_list:  v(d.servicesList),
        pricing_details: v(d.pricingDetails),
        has_pricing:    v(d.hasPricing),
        contact_page:   v(d.contactPageInfo),
        special_offers: v(d.specialOffers),
        file_details:   v(d.fileDetails),
        notes:          v(d.notes),
        status:         "new",
        assigned_to:    "",
        internal_notes: "",
      });
      console.log("Saved to MongoDB ✓");
    } catch (dbErr) {
      console.error("MongoDB save failed (non-blocking):", dbErr);
    }

    // 2) GoHighLevel webhook
    try {
      const nameParts = name.split(" ");
      const ghlRes = await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: nameParts[0] || name,
          lastName:  nameParts.slice(1).join(" ") || "",
          name, email, phone,
          companyName:      business,
          source:           "BizzOne Digital Website",
          package_selected: v(d.package),
          addons:           list(d.addons),
          website:          v(d.site),
          social:           v(d.social),
          goal:             v(d.goal),
          audience:         v(d.audience),
          logo:             v(d.logo),
          colors:           v(d.colors),
          style:            v(d.style),
          inspiration:      v(d.inspo),
          pages:            list(d.pages),
          headline:         v(d.headline),
          about:            v(d.about),
          notes:            v(d.notes),
        }),
      });
      const ghlBody = await ghlRes.text().catch(() => "");
      console.log(`GHL: ${ghlRes.status} ${ghlBody}`);
    } catch (e) {
      console.error("GHL error:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead error:", err);
    return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
  }
}