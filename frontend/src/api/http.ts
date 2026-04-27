export type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const DEFAULT_TIMEOUT_MS = 20000;

function getBaseUrl() {
  // If not provided, we fall back to same-origin (useful behind a proxy).
  const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
  return (envUrl ?? "").replace(/\/+$/, "");
}

function buildUrl(path: string) {
  const base = getBaseUrl();
  if (!base) return path; // same-origin
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(buildUrl(path), {
      ...init,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    const payload = (await parseJsonSafe(res)) as unknown;
    if (!res.ok) {
      const message =
        (payload as any)?.message ||
        (typeof payload === "string" ? payload : undefined) ||
        `HTTP ${res.status}`;
      throw new ApiError(res.status, message, payload as ApiErrorPayload | undefined);
    }
    return payload as T;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new ApiError(408, "Sorğu vaxtı bitdi (timeout).");
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}

