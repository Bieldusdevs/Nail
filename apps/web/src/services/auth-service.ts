import { apiRequest, clearCsrfToken } from "@/services/api-client";
import type { LoginFormData, RegistrationFormData } from "@/schemas/auth";

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  email: string;
  roles: string[];
}

export type LoginResult =
  | { status: "AUTHENTICATED"; user: AuthenticatedUser }
  | { status: "MFA_REQUIRED" };

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function login(credentials: LoginFormData): Promise<LoginResult> {
  if (demoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    sessionStorage.setItem(
      "lume-demo-user",
      JSON.stringify({ firstName: "Marta", email: credentials.email }),
    );
    return {
      status: "AUTHENTICATED",
      user: {
        id: "demo-user",
        firstName: "Marta",
        email: credentials.email,
        roles: ["USER"],
      },
    };
  }
  return apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function verifyMfa(code: string): Promise<LoginResult> {
  return apiRequest<LoginResult>("/auth/mfa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function registerAccount(
  registration: RegistrationFormData,
): Promise<void> {
  if (demoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    return;
  }
  await apiRequest<void>("/auth/register", {
    method: "POST",
    body: JSON.stringify(registration),
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (demoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    return;
  }
  await apiRequest<void>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  token: string,
  password: string,
): Promise<void> {
  if (demoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    return;
  }
  await apiRequest<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function logout(): Promise<void> {
  if (demoMode) {
    sessionStorage.removeItem("lume-demo-user");
    return;
  }
  await apiRequest<void>("/auth/logout", { method: "POST" });
  clearCsrfToken();
}
