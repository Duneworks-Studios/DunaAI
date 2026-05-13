type ErrorShape = {
  error?: unknown;
  message?: unknown;
  detail?: unknown;
};

function pickMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (!value || typeof value !== "object") return null;
  const payload = value as ErrorShape;
  return (
    pickMessage(payload.error) ||
    pickMessage(payload.message) ||
    pickMessage(payload.detail)
  );
}

function trimText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return trimmed.length > 500 ? `${trimmed.slice(0, 500)}...` : trimmed;
}

export async function readErrorResponseMessage(
  response: Response,
): Promise<string | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await response.json().catch(() => null);
    const parsed = pickMessage(json);
    if (parsed) return parsed;
  }

  const text = await response.text().catch(() => "");
  const fromText = trimText(text);
  if (!fromText) return null;

  try {
    const parsed = JSON.parse(fromText) as unknown;
    return pickMessage(parsed) || fromText;
  } catch {
    return fromText;
  }
}
