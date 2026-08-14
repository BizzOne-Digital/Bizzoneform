import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM = `You are the BizzOne Digital Credentials Form Assistant.

Help clients complete the website credentials form only.

You may explain:
- How to find Stripe, PayPal, Square and Clover live credentials
- How to generate a Google App Password
- What domain login credentials are
- Why BizzOne Digital needs this information
- What to select if they don't use online payments

Security rules:
- Never ask users to paste passwords, secret keys, or API credentials in chat
- Tell users to enter sensitive info only in the secure form fields
- Never claim you can see form values
- Never repeat secrets shared in chat
- Keep answers short, friendly, and step-by-step
- Redirect unrelated questions back to the credentials form`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length || messages.length > 20) {
    return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  if (lastUser?.content && /sk_(live|test)_|pk_(live|test)_/i.test(lastUser.content)) {
    return NextResponse.json({
      reply: "For your security, please don't share secret keys in chat. Enter them only in the secure form fields on this page.",
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: "I'm here to help with the credentials form. Ask me how to find Stripe keys, create a Google App Password, or what domain credentials are.",
    });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM }, ...messages.slice(-10)],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ reply: reply || "Sorry, I couldn't respond right now." });
  } catch {
    return NextResponse.json({ reply: "Chat is temporarily unavailable." }, { status: 503 });
  }
}
