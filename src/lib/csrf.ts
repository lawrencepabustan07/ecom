import { cookies } from "next/headers";

const CSRF_COOKIE = "csrf-token";
const CSRF_FIELD = "csrfToken";

export async function getCsrfToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE)?.value ?? "";
}

export function isValidCsrfToken(cookieToken: string, formToken: string) {
  return Boolean(cookieToken && formToken && cookieToken === formToken);
}

export async function assertValidCsrfToken(formData: FormData) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value ?? "";
  const formToken = String(formData.get(CSRF_FIELD) ?? "");

  if (!isValidCsrfToken(cookieToken, formToken)) {
    throw new Error("Invalid CSRF token.");
  }
}

export { CSRF_FIELD };
