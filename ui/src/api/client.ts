import type { ApiResponse, AuthStatus, TableData, TableObject, TableSchema } from "@/types/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? "Request failed"), { status: res.status });
  }
  return res.json() as Promise<T>;
}

export async function fetchMe(): Promise<AuthStatus | null> {
  try {
    return await fetchJSON<AuthStatus>("/api/me");
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

export async function login(password: string): Promise<void> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Login failed");
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST" });
}

export async function fetchTables(): Promise<TableObject[]> {
  const res = await fetchJSON<ApiResponse<TableObject[]>>("/api/tables");
  return res.data;
}

export async function fetchSchema(name: string): Promise<TableSchema> {
  const res = await fetchJSON<ApiResponse<TableSchema>>(`/api/tables/${encodeURIComponent(name)}/schema`);
  return res.data;
}

export async function fetchTableData(name: string, page: number, pageSize: number): Promise<TableData> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  const res = await fetchJSON<ApiResponse<TableData>>(
    `/api/tables/${encodeURIComponent(name)}/data?${params}`
  );
  return res.data;
}
