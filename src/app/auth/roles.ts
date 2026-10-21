// Mirrors Node/ticket/utils/roles.js: 1 = admin, 2 = user.
export const ROLES = { ADMIN: 1, USER: 2 } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Also accepts legacy "admin"/"user" strings from sessions saved before the switch.
export const normalizeRole = (value: unknown): Role =>
  value === ROLES.ADMIN || value === "1" || value === "admin" ? ROLES.ADMIN : ROLES.USER;

export const isAdmin = (user?: { role?: unknown } | null) =>
  !!user && normalizeRole(user.role) === ROLES.ADMIN;

// Where each role lands after logging in.
export const homePathFor = (user?: { role?: unknown } | null) =>
  isAdmin(user) ? "/admin/dashboard" : "/home";
