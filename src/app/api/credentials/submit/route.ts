import { NextRequest, NextResponse } from "next/server";
import { submitCredentials, PaymentMethod } from "@/lib/credentials-service";

export const runtime = "nodejs";

const METHODS: PaymentMethod[] = ["stripe", "paypal", "square", "clover", "other", "none"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    if (!body.client_name?.trim() || !body.site_name?.trim()) {
      return NextResponse.json({ error: "Name and site name are required" }, { status: 400 });
    }
    if (!METHODS.includes(body.payment_method)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }
    if (!body.consent_confirmed) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 });
    }

    // Domain credentials are now optional
    // Google App Password is optional if email_integration_skipped is true
    const skipEmail = !!body.email_integration_skipped;
    if (!skipEmail) {
      const appPass = (body.google_app_password || "").replace(/\s/g, "");
      if (appPass && appPass.length < 16) {
        return NextResponse.json({ error: "Google App Password must be at least 16 characters" }, { status: 400 });
      }
    }

    await submitCredentials(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
