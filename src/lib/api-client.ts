export type ApiError = { erro: string };

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = "Erro na requisição";
    try {
      const body = (await res.json()) as ApiError;
      msg = body.erro ?? msg;
    } catch {
      /* ignore */
    }
    if (res.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url);
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}
