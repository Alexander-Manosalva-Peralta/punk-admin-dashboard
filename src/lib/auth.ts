export const ADMIN_AUTH_TOKEN = "punk_adm_9f4b7a21ce880b91e4a2";
export const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || "admin";
export const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || "punkAdmin2026!";

export function isAuthorizedAdmin(req: Request): boolean {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (token === ADMIN_AUTH_TOKEN) return true;

  // Soporte para query param o header personalizado
  const customHeader = req.headers.get("x-admin-token") || "";
  if (customHeader === ADMIN_AUTH_TOKEN) return true;

  return false;
}
