const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

function getAccessToken() {
  const match = document.cookie.match(/(^| )access=([^;]+)/);
  if (match) return match[2];
  return localStorage.getItem("access");
}

function logoutUser() {
  // Clear all auth data
  document.cookie = "access=; path=/; max-age=0; SameSite=Lax";
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");

  // Redirect to login
  window.location.href = "/auth/signin";
}

async function refreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  const data = await res.json();

  if (!res.ok || !data.access) throw new Error("Refresh failed");

  // Save new access token
  document.cookie = `access=${data.access}; path=/; max-age=${60 * 60 * 2}; SameSite=Lax`;
  localStorage.setItem("access", data.access);

  return data.access;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retry = true
) {
  let token = getAccessToken();
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const isExpired =
      response.status === 401 ||
      data?.detail?.toLowerCase()?.includes("token") ||
      data?.code === "token_not_valid";

    if (isExpired && retry) {
      try {
        await refreshToken();
        // Retry original request once
        return await apiFetch(endpoint, options, false);
      } catch (error) {
        // Refresh failed: logout user
        logoutUser();
        throw new Error("Session expired. Please sign in again.");
      }
    }

    throw new Error(data.detail || "API Error");
  }

  return data;
}
