import { cookies } from 'next/headers';

const MEDUSA_ADMIN_URL = process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000';

export class AdminAuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export interface FetchOptions extends RequestInit {
  query?: Record<string, string>;
}

async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('rehab_admin_token')?.value ?? null;
}

function buildUrl(path: string, query?: Record<string, string>): string {
  const url = new URL(path, MEDUSA_ADMIN_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

export async function adminFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = await getAdminToken();

  if (!token) {
    throw new AdminAuthError('No admin token found');
  }

  const { query, headers, ...fetchOptions } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'no-store',
  });

  if (response.status === 401) {
    throw new AdminAuthError('Admin session expired');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function adminFetchForm<T = unknown>(
  path: string,
  formData: FormData,
  options: Omit<FetchOptions, 'body'> = {}
): Promise<T> {
  const token = await getAdminToken();

  if (!token) {
    throw new AdminAuthError('No admin token found');
  }

  const { query, headers, ...fetchOptions } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...fetchOptions,
    method: fetchOptions.method ?? 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...headers,
    },
    body: formData,
    cache: 'no-store',
  });

  if (response.status === 401) {
    throw new AdminAuthError('Admin session expired');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}