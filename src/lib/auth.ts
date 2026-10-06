/**
 * Mock authentication for the MVP.
 * A cookie marks the browser as signed in; middleware.ts guards the app routes.
 * Replace with a real auth provider (NextAuth / Auth.js, Clerk, Supabase…) later.
 */
export const SESSION_COOKIE = "pc_session";

export const DEMO_USER = {
  email: "admin@pharmacare.ph",
  password: "admin123",
};

export function signIn() {
  document.cookie = `${SESSION_COOKIE}=demo; path=/; max-age=${60 * 60 * 8}; samesite=lax`;
}

export function signOut() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
