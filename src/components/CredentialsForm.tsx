"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import CredentialsChatBot from "./CredentialsChatBot";

const field = "w-full rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3.5 text-base text-white placeholder-white/40 outline-none transition-colors focus:border-brand-mint/60";
const labelCls = "mb-2 block text-sm font-semibold text-white/90";

type PaymentMethod = "stripe" | "paypal" | "square" | "clover" | "other" | "none";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: "stripe", label: "Stripe" },
  { id: "paypal", label: "PayPal" },
  { id: "square", label: "Square" },
  { id: "clover", label: "Clover" },
  { id: "other", label: "Other" },
  { id: "none", label: "Not used on my website" },
];

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-mint">
      <span className="h-px flex-1 bg-white/12" />{children}<span className="h-px flex-1 bg-white/12" />
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  const isOptional = label.includes("(optional)");
  return (
    <div>
      <label className={labelCls}>
        {label}
        {!isOptional && <span className="text-brand-mint">*</span>}
      </label>
      <div className="relative">
        <input type={show ? "text" : "password"} className={`${field} pr-14`} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete="new-password" />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function CredentialsForm({ token }: { token?: string }) {
  const [tokenState, setTokenState] = useState<"loading" | "ok" | "bad" | "none">(token ? "loading" : "none");
  const [tokenMsg, setTokenMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const [clientName, setClientName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [stripePk, setStripePk] = useState("");
  const [stripeSk, setStripeSk] = useState("");
  const [paypalId, setPaypalId] = useState("");
  const [paypalSecret, setPaypalSecret] = useState("");
  const [squareAppId, setSquareAppId] = useState("");
  const [squareToken, setSquareToken] = useState("");
  const [squareLoc, setSquareLoc] = useState("");
  const [cloverMerchant, setCloverMerchant] = useState("");
  const [cloverAppId, setCloverAppId] = useState("");
  const [cloverSecret, setCloverSecret] = useState("");
  const [otherCreds, setOtherCreds] = useState("");
  const [skipEmail, setSkipEmail] = useState(false);
  const [appPassword, setAppPassword] = useState("");
  const [domainLogin, setDomainLogin] = useState("");
  const [domainPassword, setDomainPassword] = useState("");
  const [domainProvider, setDomainProvider] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/credentials/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          setTokenState("ok");
          if (d.prefilled?.client_name) setClientName(d.prefilled.client_name);
          if (d.prefilled?.site_name) setSiteName(d.prefilled.site_name);
        } else {
          setTokenState("bad");
          setTokenMsg(d.message || "Invalid link");
        }
      })
      .catch(() => { setTokenState("bad"); setTokenMsg("Unable to validate link"); });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSending(true);
    try {
      const res = await fetch("/api/credentials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          client_name: clientName,
          site_name: siteName,
          payment_method: paymentMethod,
          stripe_publishable_key: paymentMethod === "stripe" ? stripePk : undefined,
          stripe_secret_key: paymentMethod === "stripe" ? stripeSk : undefined,
          paypal_client_id: paymentMethod === "paypal" ? paypalId : undefined,
          paypal_client_secret: paymentMethod === "paypal" ? paypalSecret : undefined,
          square_application_id: paymentMethod === "square" ? squareAppId : undefined,
          square_access_token: paymentMethod === "square" ? squareToken : undefined,
          square_location_id: paymentMethod === "square" ? squareLoc : undefined,
          clover_merchant_id: paymentMethod === "clover" ? cloverMerchant : undefined,
          clover_app_id: paymentMethod === "clover" ? cloverAppId : undefined,
          clover_app_secret: paymentMethod === "clover" ? cloverSecret : undefined,
          other_credentials: paymentMethod === "other" ? otherCreds : undefined,
          google_app_password: skipEmail ? undefined : appPassword,
          email_integration_skipped: skipEmail,
          domain_login: domainLogin,
          domain_password: domainPassword,
          domain_provider: domainProvider || undefined,
          consent_confirmed: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSent(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Submission failed");
    } finally {
      setSending(false);
    }
  };

  if (tokenState === "loading") {
    return (
      <div className="section relative z-10 flex min-h-screen items-center justify-center py-20">
        <p className="text-white/50">Validating secure link...</p>
      </div>
    );
  }

  if (tokenState === "bad") {
    return (
      <div className="section relative z-10 flex min-h-screen items-center justify-center py-20 px-4">
        <div className="glass max-w-md rounded-3xl p-8 text-center">
          <h1 className="text-xl font-bold text-brand-mint">Link unavailable</h1>
          <p className="mt-3 text-white/60">{tokenMsg}</p>
          <p className="mt-4 text-sm text-white/40">Please contact BizzOne Digital for a new credentials link.</p>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="section relative z-10 flex min-h-screen items-center justify-center py-20 px-4">
        <div className="glass max-w-md rounded-3xl p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 text-brand-mint" size={48} />
          <h1 className="text-xl font-bold text-white">Credentials submitted</h1>
          <p className="mt-3 text-white/60">Thank you! Your credentials have been securely received. Our team will configure your website.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="section relative z-10 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <header className="mb-8 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-purple-light">BizzOne Digital</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Website Credentials</h1>
            <p className="mt-3 text-white/60">Please provide the credentials below so our team can configure your website integrations securely.</p>
          </header>

          <form onSubmit={submit} className="glass rounded-3xl p-6 sm:p-8" autoComplete="off">
            <Divider>Client Information</Divider>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Your name <span className="text-brand-mint">*</span></label>
                <input className={field} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Enter your full name" required autoComplete="name" />
              </div>
              <div>
                <label className={labelCls}>Website or business name <span className="text-brand-mint">*</span></label>
                <input className={field} value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Enter your site or business name" required />
              </div>
            </div>

            <Divider>Payment Method</Divider>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map(opt => (
                <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id)}
                  className={`rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${paymentMethod === opt.id ? "border-brand-mint bg-brand-mint/10 text-brand-mint" : "border-white/12 text-white/70 hover:border-white/25"}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-5">
              {paymentMethod === "stripe" && (
                <>
                  <div>
                    <label className={labelCls}>Publishable key (optional)</label>
                    <input className={field} value={stripePk} onChange={e => setStripePk(e.target.value)} placeholder="pk_live_..." autoComplete="off" />
                  </div>
                  <PasswordInput label="Secret key (optional)" value={stripeSk} onChange={setStripeSk} placeholder="sk_live_..." />
                </>
              )}
              {paymentMethod === "paypal" && (
                <>
                  <div>
                    <label className={labelCls}>PayPal Client ID (optional)</label>
                    <input className={field} value={paypalId} onChange={e => setPaypalId(e.target.value)} autoComplete="off" />
                  </div>
                  <PasswordInput label="PayPal Client Secret (optional)" value={paypalSecret} onChange={setPaypalSecret} />
                </>
              )}
              {paymentMethod === "square" && (
                <>
                  <div>
                    <label className={labelCls}>Square Application ID (optional)</label>
                    <input className={field} value={squareAppId} onChange={e => setSquareAppId(e.target.value)} autoComplete="off" />
                  </div>
                  <PasswordInput label="Square Access Token (optional)" value={squareToken} onChange={setSquareToken} />
                  <div>
                    <label className={labelCls}>Square Location ID (optional)</label>
                    <input className={field} value={squareLoc} onChange={e => setSquareLoc(e.target.value)} autoComplete="off" />
                  </div>
                </>
              )}
              {paymentMethod === "clover" && (
                <>
                  <p className="text-xs text-white/45">Enter the live Clover credentials if available.</p>
                  <div>
                    <label className={labelCls}>Clover Merchant ID (optional)</label>
                    <input className={field} value={cloverMerchant} onChange={e => setCloverMerchant(e.target.value)} autoComplete="off" />
                  </div>
                  <div>
                    <label className={labelCls}>Clover App ID (optional)</label>
                    <input className={field} value={cloverAppId} onChange={e => setCloverAppId(e.target.value)} autoComplete="off" />
                  </div>
                  <PasswordInput label="Clover App Secret or API token (optional)" value={cloverSecret} onChange={setCloverSecret} />
                </>
              )}
              {paymentMethod === "other" && (
                <div>
                  <label className={labelCls}>API keys or integration credentials (optional)</label>
                  <textarea className={`${field} min-h-[120px] resize-y`} value={otherCreds} onChange={e => setOtherCreds(e.target.value)}
                    placeholder="Enter the API keys that our team has asked you to share." />
                </div>
              )}
              {paymentMethod === "none" && (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                  No payment credentials are required. You can continue and submit the rest of the form.
                </p>
              )}
            </div>

            <Divider>Google App Password</Divider>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/65">
              <p className="mb-2">Please share the App Password by following the steps below.</p>
              <p className="mb-3">Your main email password is not used on the website. Google provides a separate secure &quot;App Password&quot; for website integrations.</p>
              <ol className="list-decimal list-inside space-y-1 text-white/55">
                <li>Go to your Google Account Settings</li>
                <li>Open &quot;Security&quot;</li>
                <li>Turn ON &quot;2-Step Verification&quot; first</li>
                <li>Search for &quot;App Passwords&quot; in Security settings</li>
                <li>Create a new App Password for &quot;Mail&quot;</li>
                <li>Copy the generated 16-character password and enter it below</li>
              </ol>
            </div>
            <div className="mt-4 space-y-4">
              <label className="flex items-start gap-2 text-sm text-white/60">
                <input type="checkbox" checked={skipEmail} onChange={e => setSkipEmail(e.target.checked)} className="mt-1" />
                Email integration is not required
              </label>
              {!skipEmail && (
                <div>
                  <PasswordInput label="Google App Password" value={appPassword} onChange={setAppPassword} placeholder="Enter the 16-character App Password" />
                  <p className="mt-1.5 text-xs text-white/40">Do not enter your normal email password.</p>
                </div>
              )}
            </div>

            <Divider>Domain Account Credentials</Divider>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Email, username or client ID (optional)</label>
                <input className={field} value={domainLogin} onChange={e => setDomainLogin(e.target.value)}
                  placeholder="Enter the email, username or client ID used to sign in" autoComplete="off" />
              </div>
              <PasswordInput label="Domain account password (optional)" value={domainPassword} onChange={setDomainPassword} />
              <div>
                <label className={labelCls}>Domain provider (optional)</label>
                <input className={field} value={domainProvider} onChange={e => setDomainProvider(e.target.value)}
                  placeholder="For example: GoDaddy, Namecheap or Squarespace" autoComplete="off" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <label className="flex items-start gap-3 text-sm text-white/70">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required className="mt-1" />
                <span>I confirm that I am authorized to share these credentials with BizzOne Digital for the purpose of configuring my website. <span className="text-brand-mint">*</span></span>
              </label>
              {err && <p className="text-sm text-red-400">{err}</p>}
              <button type="submit" disabled={sending || !consent}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-mint py-4 text-base font-bold text-ink transition-all hover:brightness-110 disabled:opacity-50">
                {sending ? "Submitting..." : <><ShieldCheck size={18} /> Submit credentials securely</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <CredentialsChatBot />
    </>
  );
}
