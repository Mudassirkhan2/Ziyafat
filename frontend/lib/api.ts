const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RequestOptions = {
  method?: string;
  body?: unknown;
};

let refreshPromise: Promise<void> | null = null;

async function tryRefresh(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired");
    }
  }).finally(() => {
    Promise.resolve().then(() => { refreshPromise = null; });
  });

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  _retry = false
): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  if (response.status === 401 && !_retry) {
    await tryRefresh();
    return apiRequest<T>(path, options, true);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const doUpload = async (retry = false): Promise<T> => {
      const response = await fetch(`${API_BASE}/api/v1${path}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.status === 401 && !retry) {
        await tryRefresh();
        return doUpload(true);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(error.detail ?? `HTTP ${response.status}`);
      }
      return response.json();
    };
    return doUpload();
  },
};
