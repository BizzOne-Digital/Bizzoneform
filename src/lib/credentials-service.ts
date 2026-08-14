import { ObjectId } from "mongodb";
import { getCredentials, getSubmissions } from "./mongodb";
import { encryptValue, encryptOptional, decryptValue, EncryptedValue } from "./encryption";
import {
  generateSecureToken,
  hashToken,
  getTokenExpirationDate,
  buildCredentialsPublicUrl,
} from "./tokens";

export type PaymentMethod = "stripe" | "paypal" | "square" | "clover" | "other" | "none";

export interface CredentialsDoc {
  _id?: ObjectId;
  submission_id: ObjectId | null;
  client_name: string;
  site_name: string;
  payment_method: PaymentMethod;
  payment_fields: Record<string, EncryptedValue>;
  google_app_password: EncryptedValue | null;
  email_integration_skipped: boolean;
  domain_login: EncryptedValue;
  domain_password: EncryptedValue;
  domain_provider?: string;
  consent_confirmed: boolean;
  submitted_at: string | null;
  request?: {
    token_hash?: string;
    token_created_at?: string;
    token_expires_at?: string;
    completed_at?: string;
    revoked_at?: string;
    allow_resubmission?: boolean;
  };
}

export type CredentialsStatus = "not_requested" | "waiting" | "submitted" | "expired" | "revoked";

export const PAYMENT_FIELD_KEYS: Record<PaymentMethod, string[]> = {
  stripe: ["stripe_publishable_key", "stripe_secret_key"],
  paypal: ["paypal_client_id", "paypal_client_secret"],
  square: ["square_application_id", "square_access_token", "square_location_id"],
  clover: ["clover_merchant_id", "clover_app_id", "clover_app_secret"],
  other: ["other_credentials"],
  none: [],
};

export { FIELD_LABELS } from "./credentials-labels";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match credentials form name + business to an existing onboarding submission. */
async function findMatchingSubmission(
  clientName: string,
  siteName: string,
): Promise<ObjectId | null> {
  const submissions = await getSubmissions();
  const name = clientName.trim();
  const business = siteName.trim();
  if (!name || !business) return null;

  const match = await submissions.findOne(
    {
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
      business: { $regex: new RegExp(`^${escapeRegex(business)}$`, "i") },
    },
    { sort: { created_at: -1 } },
  );

  return match?._id ?? null;
}

function getStatus(doc: CredentialsDoc | null): CredentialsStatus {
  if (!doc) return "not_requested";
  if (doc.submitted_at && !doc.request?.allow_resubmission) return "submitted";
  if (!doc.request?.token_hash) return "not_requested";
  if (doc.request.revoked_at) return "revoked";
  if (
    doc.request.token_expires_at &&
    new Date(doc.request.token_expires_at) < new Date() &&
    !doc.submitted_at
  ) {
    return "expired";
  }
  if (doc.submitted_at) return "submitted";
  return "waiting";
}

export async function getCredentialsInfo(submissionId: string) {
  const col = await getCredentials();
  const doc = await col.findOne({ submission_id: new ObjectId(submissionId) }) as CredentialsDoc | null;
  const status = getStatus(doc);
  return {
    status,
    credentials_id: doc?._id?.toString(),
    token_created_at: doc?.request?.token_created_at,
    token_expires_at: doc?.request?.token_expires_at,
    submitted_at: doc?.submitted_at,
    payment_method: doc?.payment_method,
  };
}

export async function createCredentialsRequest(submissionId: string) {
  const submissions = await getSubmissions();
  const submission = await submissions.findOne({ _id: new ObjectId(submissionId) });
  if (!submission) throw new Error("Submission not found");

  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();
  const expires = getTokenExpirationDate().toISOString();

  const col = await getCredentials();
  const existing = await col.findOne({ submission_id: new ObjectId(submissionId) }) as CredentialsDoc | null;

  if (existing?.submitted_at && !existing.request?.allow_resubmission) {
    throw new Error("Credentials already submitted");
  }

  const base = {
    submission_id: new ObjectId(submissionId),
    client_name: String(submission.name || ""),
    site_name: String(submission.business || ""),
    request: {
      token_hash: tokenHash,
      token_created_at: now,
      token_expires_at: expires,
      revoked_at: undefined,
      completed_at: undefined,
      allow_resubmission: false,
    },
    submitted_at: null,
  };

  if (existing) {
    await col.updateOne({ _id: existing._id }, { $set: base });
  } else {
    await col.insertOne({
      ...base,
      payment_method: "none",
      payment_fields: {},
      google_app_password: null,
      email_integration_skipped: false,
      domain_login: encryptValue(""),
      domain_password: encryptValue(""),
      consent_confirmed: false,
    } as CredentialsDoc);
  }

  return {
    public_url: buildCredentialsPublicUrl(token),
    info: await getCredentialsInfo(submissionId),
  };
}

export async function revokeCredentialsRequest(submissionId: string) {
  const col = await getCredentials();
  await col.updateOne(
    { submission_id: new ObjectId(submissionId) },
    { $set: { "request.revoked_at": new Date().toISOString() } },
  );
  return getCredentialsInfo(submissionId);
}

export async function validatePublicToken(token: string) {
  const col = await getCredentials();
  const doc = await col.findOne({ "request.token_hash": hashToken(token) }) as CredentialsDoc | null;
  if (!doc) return { valid: false as const, error: "invalid" as const };
  if (doc.request?.revoked_at) return { valid: false as const, error: "revoked" as const };
  if (doc.submitted_at && !doc.request?.allow_resubmission) {
    return { valid: false as const, error: "completed" as const };
  }
  if (doc.request?.token_expires_at && new Date(doc.request.token_expires_at) < new Date()) {
    return { valid: false as const, error: "expired" as const };
  }
  return {
    valid: true as const,
    prefilled: { client_name: doc.client_name, site_name: doc.site_name },
  };
}

export interface SubmitPayload {
  token?: string;
  client_name: string;
  site_name: string;
  payment_method: PaymentMethod;
  stripe_publishable_key?: string;
  stripe_secret_key?: string;
  paypal_client_id?: string;
  paypal_client_secret?: string;
  square_application_id?: string;
  square_access_token?: string;
  square_location_id?: string;
  clover_merchant_id?: string;
  clover_app_id?: string;
  clover_app_secret?: string;
  other_credentials?: string;
  google_app_password?: string;
  email_integration_skipped?: boolean;
  domain_login: string;
  domain_password: string;
  domain_provider?: string;
  consent_confirmed: boolean;
}

export async function submitCredentials(data: SubmitPayload) {
  const col = await getCredentials();
  let doc: CredentialsDoc | null = null;
  let submissionId: ObjectId | null = null;

  if (data.token) {
    doc = await col.findOne({ "request.token_hash": hashToken(data.token) }) as CredentialsDoc | null;
    if (!doc) throw new Error("Invalid or expired link");
    if (doc.request?.revoked_at) throw new Error("This link has been revoked");
    if (doc.submitted_at && !doc.request?.allow_resubmission) throw new Error("Already submitted");
    if (doc.request?.token_expires_at && new Date(doc.request.token_expires_at) < new Date()) {
      throw new Error("This link has expired");
    }
    submissionId = doc.submission_id;
  } else {
    // Generic credentials link — auto-match by contact name + business name
    submissionId = await findMatchingSubmission(data.client_name, data.site_name);

    if (submissionId) {
      const existingForClient = await col.findOne({
        submission_id: submissionId,
        submitted_at: { $ne: null },
      }) as CredentialsDoc | null;
      if (existingForClient && !existingForClient.request?.allow_resubmission) {
        throw new Error("Credentials have already been submitted for this client");
      }
    }

    const inserted = await col.insertOne({
      submission_id: submissionId,
      client_name: data.client_name,
      site_name: data.site_name,
      payment_method: data.payment_method,
      payment_fields: {},
      google_app_password: null,
      email_integration_skipped: false,
      domain_login: encryptValue(""),
      domain_password: encryptValue(""),
      consent_confirmed: false,
      submitted_at: null,
    } as CredentialsDoc);
    doc = { _id: inserted.insertedId, submission_id: submissionId } as CredentialsDoc;
  }

  const paymentFields: Record<string, EncryptedValue> = {};
  for (const key of PAYMENT_FIELD_KEYS[data.payment_method]) {
    const val = (data as unknown as Record<string, string | undefined>)[key];
    if (val?.trim()) paymentFields[key] = encryptValue(val.trim());
  }

  const googlePassword = data.email_integration_skipped
    ? null
    : (data.google_app_password || "").replace(/\s/g, "");

  const now = new Date().toISOString();
  const update = {
    submission_id: submissionId,
    client_name: data.client_name,
    site_name: data.site_name,
    payment_method: data.payment_method,
    payment_fields: paymentFields,
    google_app_password: encryptOptional(googlePassword || undefined),
    email_integration_skipped: !!data.email_integration_skipped,
    domain_login: encryptValue(data.domain_login.trim()),
    domain_password: encryptValue(data.domain_password),
    domain_provider: data.domain_provider?.trim() || undefined,
    consent_confirmed: true,
    submitted_at: now,
  };

  await col.updateOne(
    { _id: doc!._id },
    {
      $set: {
        ...update,
        "request.completed_at": now,
        "request.allow_resubmission": false,
      },
    },
  );
}

export async function getCredentialsMetadata(credentialsId: string) {
  const col = await getCredentials();
  const doc = await col.findOne({ _id: new ObjectId(credentialsId) }) as CredentialsDoc | null;
  if (!doc?.submitted_at) return null;

  const fieldIds: string[] = Object.keys(doc.payment_fields || {});
  if (doc.google_app_password && !doc.email_integration_skipped) fieldIds.push("google_app_password");
  if (doc.domain_login) fieldIds.push("domain_login");
  if (doc.domain_password) fieldIds.push("domain_password");

  return {
    id: doc._id!.toString(),
    submission_id: doc.submission_id?.toString() || null,
    client_name: doc.client_name,
    site_name: doc.site_name,
    submitted_at: doc.submitted_at,
    payment_method: doc.payment_method,
    domain_provider: doc.domain_provider,
    email_integration_skipped: doc.email_integration_skipped,
    field_ids: fieldIds,
  };
}

export async function revealField(credentialsId: string, fieldId: string): Promise<string> {
  const col = await getCredentials();
  const doc = await col.findOne({ _id: new ObjectId(credentialsId) }) as CredentialsDoc | null;
  if (!doc?.submitted_at) throw new Error("Not found");

  let encrypted: EncryptedValue | null | undefined;
  if (fieldId === "google_app_password") encrypted = doc.google_app_password;
  else if (fieldId === "domain_login") encrypted = doc.domain_login;
  else if (fieldId === "domain_password") encrypted = doc.domain_password;
  else encrypted = doc.payment_fields?.[fieldId];

  if (!encrypted) throw new Error("Field not found");
  return decryptValue(encrypted);
}

export async function getCredentialsBySubmissionId(submissionId: string) {
  const col = await getCredentials();
  const doc = await col.findOne({
    submission_id: new ObjectId(submissionId),
    submitted_at: { $ne: null },
  }) as CredentialsDoc | null;
  if (!doc?._id) return null;
  return getCredentialsMetadata(doc._id.toString());
}
