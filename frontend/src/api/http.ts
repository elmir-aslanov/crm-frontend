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
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  return (envUrl ?? "").replace(/\/+$/, "");
}

function buildUrl(path: string) {
  const base = getBaseUrl();
  if (!base) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// Deduplicate concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const token = localStorage.getItem("refreshToken");
  if (!token) return null;

  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: { accessToken?: string; refreshToken?: string };
    };

    const newAccess = data?.data?.accessToken;
    if (!newAccess) return null;

    localStorage.setItem("accessToken", newAccess);
    if (data.data?.refreshToken) {
      localStorage.setItem("refreshToken", data.data.refreshToken);
    }
    return newAccess;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { timeoutMs?: number; _skipRefresh?: boolean } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Prevent passing internal flag to fetch
  const { _skipRefresh, ...fetchInit } = init;

  try {
    const headers = new Headers(fetchInit.headers);
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Content-Type") && fetchInit.body) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(buildUrl(path), {
      ...fetchInit,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    const payload = await parseJsonSafe(res);

    if (!res.ok) {
      // 401 → try refresh (only once, skip for /auth/* routes)
      if (res.status === 401 && !_skipRefresh && !path.includes("/auth/")) {
        if (!refreshPromise) {
          refreshPromise = tryRefreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        if (newToken) {
          // Retry original request with new token
          return apiFetch<T>(path, { ...init, _skipRefresh: true });
        }

        // Refresh failed — clear session and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new ApiError(401, "Sessiya bitdi. Yenidən daxil olun.");
      }

      const payloadObj = payload as ApiErrorPayload | undefined;
      const message =
        payloadObj?.message ||
        (typeof payload === "string" ? payload : undefined) ||
        `HTTP ${res.status}`;
      throw new ApiError(res.status, message, payloadObj);
    }

    return payload as T;
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new ApiError(408, "Sorğu vaxtı bitdi (timeout).");
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}
