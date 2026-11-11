export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function apiSend<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `${method} ${path} failed (${res.status})`);
  }
  return data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiSend<T>("POST", path, body);
}
