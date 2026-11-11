export type AuthRole = "customer" | "seller" | "admin";

export type AuthUser = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: AuthRole;
};

export const AUTH_STORAGE_KEY = "solangi-auth-user";

/** Public register roles — admin uses dedicated demo gate. */
export const AUTH_ROLES: {
  id: Exclude<AuthRole, "admin">;
  labelKey: "roleCustomer" | "roleSeller";
}[] = [
  { id: "customer", labelKey: "roleCustomer" },
  { id: "seller", labelKey: "roleSeller" },
];

export function homeForRole(role: AuthRole): "/account" | "/seller" | "/admin" {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller";
  return "/account";
}
