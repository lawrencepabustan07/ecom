import { headers } from "next/headers";

function parseOriginHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

export function isAllowedCsrfOrigin(origin: string, host: string) {
  return Boolean(origin && host && parseOriginHost(origin) === host);
}

export async function assertValidCsrfRequest() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? headerStore.get("referer") ?? "";
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "";

  if (!isAllowedCsrfOrigin(origin, host)) {
    throw new Error("Invalid CSRF request origin.");
  }
}
