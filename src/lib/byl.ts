// Byl API helpers (QPay third-party gateway)
// Docs: https://byl.mn/docs/api/

import crypto from "crypto";

const BYL_BASE_URL = "https://byl.mn/api/v1";

export interface BylInvoice {
  id: number;
  status: "draft" | "open" | "paid" | "void";
  amount: number;
  number: string;
  url: string;
  created_at: string;
  updated_at: string;
}

function getConfig() {
  const token = process.env.BYL_TOKEN;
  const projectId = process.env.BYL_PROJECT_ID;

  if (!token || !projectId) {
    throw new Error("Byl credentials not configured (BYL_TOKEN, BYL_PROJECT_ID)");
  }

  return { token, projectId };
}

function bylHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function createBylInvoice(params: {
  amount: number;
  description?: string;
}): Promise<BylInvoice> {
  const { token, projectId } = getConfig();

  const response = await fetch(
    `${BYL_BASE_URL}/projects/${projectId}/invoices`,
    {
      method: "POST",
      headers: bylHeaders(token),
      body: JSON.stringify({
        amount: params.amount,
        description: params.description ?? "Heir Order",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Byl invoice creation failed: ${error}`);
  }

  const json = await response.json();
  return json.data;
}

export async function getBylInvoice(
  invoiceId: string | number
): Promise<BylInvoice> {
  const { token, projectId } = getConfig();

  const response = await fetch(
    `${BYL_BASE_URL}/projects/${projectId}/invoices/${invoiceId}`,
    { headers: bylHeaders(token) }
  );

  if (!response.ok) {
    throw new Error(`Byl invoice fetch failed: ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

export function verifyBylSignature(payload: string, signature: string): boolean {
  const secret = process.env.BYL_WEBHOOK_SECRET;
  if (!secret) throw new Error("BYL_WEBHOOK_SECRET not configured");

  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return computed === signature;
}
