import type { ApiErrorPayload } from "@/types/booking";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.error;
    this.requestId = payload.requestId;
  }
}

let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch("/api/v1/auth/csrf", {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("Não foi possível iniciar uma sessão segura.");
  const payload = (await response.json()) as { token: string };
  csrfToken = payload.token;
  return payload.token;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-CSRF-TOKEN", await getCsrfToken());
  }

  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({
      error: "UNEXPECTED_ERROR",
      message: "Ocorreu um erro inesperado. Tenta novamente.",
    }))) as ApiErrorPayload;
    throw new ApiError(response.status, payload);
  }

  if (
    response.status === 204 ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}
