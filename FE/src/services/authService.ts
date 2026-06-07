import { API_BASE_URL } from '../config/apiConfig';

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  status: string;
  message: string;
  token: string;
};

type JwtPayload = {
  role?: string | string[];
  Role?: string | string[];
  [key: string]: unknown;
};


const TOKEN_KEY = "catkaa_auth_token";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message ?? "Đăng nhập thất bại");
  }

  return data as LoginResponse;
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function getJwtPayload(): JwtPayload | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const payloadPart = token.split(".")[1];

  if (!payloadPart) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAuthUsername(): string | null {
  const payload = getJwtPayload();
  // .NET JwtSecurityTokenHandler maps ClaimTypes.Name → "unique_name"
  const name = payload?.unique_name ?? payload?.name ?? payload?.sub;
  return typeof name === "string" ? name : null;
}

export function getAuthRole() {
  const payload = getJwtPayload();
  const roleValue = payload?.role ?? payload?.Role;

  if (Array.isArray(roleValue)) {
    return roleValue[0] ?? null;
  }

  return roleValue ?? null;
}

export async function upgradeToHost(planId: number): Promise<{ message: string; newToken: string }> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/users/upgrade-to-host`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message ?? "Nâng cấp thất bại");
  }

  return data;
}
