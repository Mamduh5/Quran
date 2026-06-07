import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const MAXMEM = 64 * 1024 * 1024;

export async function hashAdminPassword(password: string): Promise<string> {
  if (password.length < 12) {
    throw new Error("Admin password must be at least 12 characters.");
  }

  const salt = randomBytes(16);
  const hash = await derive(password, salt, {
    n: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    hash.toString("base64url")
  ].join("$");
}

export async function verifyAdminPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parsed = parsePasswordHash(storedHash);
  if (!parsed) {
    return false;
  }

  const actual = await derive(password, parsed.salt, parsed.params);
  return (
    actual.length === parsed.hash.length && timingSafeEqual(actual, parsed.hash)
  );
}

function parsePasswordHash(storedHash: string) {
  const [algorithm, n, r, p, salt, hash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !hash) {
    return null;
  }

  const params = {
    n: Number.parseInt(n, 10),
    r: Number.parseInt(r, 10),
    p: Number.parseInt(p, 10)
  };

  if (
    !Number.isInteger(params.n) ||
    !Number.isInteger(params.r) ||
    !Number.isInteger(params.p)
  ) {
    return null;
  }

  return {
    params,
    salt: Buffer.from(salt, "base64url"),
    hash: Buffer.from(hash, "base64url")
  };
}

function derive(
  password: string,
  salt: Buffer,
  params: { n: number; r: number; p: number }
) {
  return scryptAsync(password, salt, KEY_LENGTH, {
    N: params.n,
    r: params.r,
    p: params.p,
    maxmem: MAXMEM
  });
}
