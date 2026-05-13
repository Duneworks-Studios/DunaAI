import { Whop } from "@whop/sdk";

function bearerApiKey(key: string) {
  const k = key.trim();
  if (/^bearer\s/i.test(k)) return k;
  return `Bearer ${k}`;
}

/** Base64-encode the raw webhook signing secret from the Whop dashboard (Standard Webhooks). */
function encodedWebhookSecret(raw: string) {
  return Buffer.from(raw.trim(), "utf8").toString("base64");
}

export function createWhopWebhookClient(): Whop | null {
  const apiKey = process.env.WHOP_API_KEY?.trim();
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET?.trim();
  if (!apiKey || !webhookSecret) return null;
  return new Whop({
    apiKey: bearerApiKey(apiKey),
    webhookKey: encodedWebhookSecret(webhookSecret),
  });
}

export function createWhopApiClient(): Whop | null {
  const apiKey = process.env.WHOP_API_KEY?.trim();
  if (!apiKey) return null;
  return new Whop({ apiKey: bearerApiKey(apiKey) });
}

export function whopWebhookConfigured(): boolean {
  return Boolean(
    process.env.WHOP_API_KEY?.trim() && process.env.WHOP_WEBHOOK_SECRET?.trim(),
  );
}
