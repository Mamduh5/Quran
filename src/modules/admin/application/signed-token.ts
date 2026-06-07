import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type SignedTokenPayload = {
  purpose: string;
  expiresAt: number;
  issuedAt: number;
  nonce: string;
  email?: string;
};

export function createSignedToken(
  payload: Omit<SignedTokenPayload, "issuedAt" | "nonce"> & {
    issuedAt?: number;
    nonce?: string;
  },
  secret: string
): string {
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      issuedAt: payload.issuedAt ?? Date.now(),
      nonce: payload.nonce ?? randomBytes(16).toString("base64url")
    }),
    "utf8"
  ).toString("base64url");
  const signature = sign(body, secret);

  return `${body}.${signature}`;
}

export function verifySignedToken(
  token: string,
  secret: string,
  purpose: string,
  now = Date.now()
): SignedTokenPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature || !constantTimeEqual(signature, sign(body, secret))) {
    return null;
  }

  const payload = parsePayload(body);
  if (!payload || payload.purpose !== purpose || payload.expiresAt <= now) {
    return null;
  }

  return payload;
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function parsePayload(body: string): SignedTokenPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Partial<SignedTokenPayload>;

    if (
      typeof parsed.purpose !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    return {
      purpose: parsed.purpose,
      expiresAt: parsed.expiresAt,
      issuedAt: parsed.issuedAt,
      nonce: parsed.nonce,
      email: typeof parsed.email === "string" ? parsed.email : undefined
    };
  } catch {
    return null;
  }
}
