import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM = `You are BizzOne Digital's friendly AI assistant on the website onboarding page. Answer questions about our web development services clearly and briefly.

Key info:
- Company: BizzOne Digital — AI Automation & Digital Growth Agency based in Mississauga, Ontario
- We serve businesses across Canada and the United States
- Website packages: Starter ($79, up to 5 pages), Standard ($149, up to 7 pages with admin portal)
- Add-ons available at extra cost: Logo design, domain, extra pages, customer portal, payment integration, eCommerce, booking system, CRM integration, multi-language, custom design
- Process: 1) Client fills the form 2) We build in 24-48hrs 3) Client reviews & approves 4) Pay after satisfied 5) Site goes live
- Payment: Pay AFTER you are satisfied with your design. No upfront payment required to submit the form.
- Services also include: Paid Advertising, Design & Branding, Content Creation, Content Strategy, Social Media Management
- Contact: Through the onboarding form on this page, or visit bizzonedigital.com

Keep answers short (2-4 sentences). Be helpful, professional and friendly. If unsure, direct them to fill out the form or visit bizzonedigital.com.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required." }, { status: 400 });
    }

    const API_KEY = (process.env.ANTHROPIC_API_KEY || "").trim();
    if (!API_KEY) {
      // Fallback: simple keyword-based responses if no API key
      const lower = message.toLowerCase();
      let reply = "Thanks for reaching out! For detailed information, please fill out the form above or visit bizzonedigital.com. Our team will get back to you within 24-48 hours.";
      if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
        reply = "Our Starter package is $79 (up to 5 pages) and Standard is $149 (up to 7 pages with admin portal). Add-ons like logo design, eCommerce, and payment integration are available at extra cost. You only pay after you're satisfied with the design!";
      } else if (lower.includes("payment") || lower.includes("pay")) {
        reply = "You only pay after you are satisfied with your design. No upfront payment is required to submit the form. Once you approve, we'll send a secure payment link.";
      } else if (lower.includes("how long") || lower.includes("timeline") || lower.includes("time")) {
        reply = "Once you submit the form, our team starts building within 24-48 hours. You'll review and approve the design, and your site goes live shortly after — often within hours of approval.";
      } else if (lower.includes("package") || lower.includes("plan") || lower.includes("starter") || lower.includes("standard")) {
        reply = "We offer two main packages: Starter ($79) with up to 5 pages, contact form, mobile responsive design, and basic SEO. Standard ($149) includes up to 7 pages, admin portal, gallery management, and blog/CMS. Add-ons are available for extra features.";
      } else if (lower.includes("add-on") || lower.includes("addon") || lower.includes("extra") || lower.includes("logo") || lower.includes("ecommerce")) {
        reply = "We offer add-ons including: Logo Design, Domain Purchase, Extra Pages, Admin/Customer Portal, Payment Integration, eCommerce, Booking System, Email Newsletter, CRM Integration, Multi-Language, and Fully Custom Design. Each is quoted separately based on your package.";
      } else if (lower.includes("where") || lower.includes("location") || lower.includes("based")) {
        reply = "We're based in Mississauga, Ontario, and serve businesses across Canada and the United States. Everything is handled online — just fill out the form above to get started!";
      } else if (lower.includes("contact") || lower.includes("talk") || lower.includes("call")) {
        reply = "The best way to reach us is by filling out the onboarding form above. Our team will contact you within 24-48 hours. You can also visit bizzonedigital.com for more information.";
      }
      return NextResponse.json({ reply });
    }

    // Call Anthropic API
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: SYSTEM,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again or fill out the form above.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ reply: "Sorry, something went wrong. Please fill out the form above and our team will help you directly." });
  }
}