export function isAdminRole(role?: string | null) {
  return role === "admin";
}

export function getDashboardPathForRole(role?: string | null) {
  return isAdminRole(role) ? "/admin" : "/account";
}

export function isBlockedUser(isBlocked?: boolean | null) {
  return Boolean(isBlocked);
}
