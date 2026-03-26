const DEFAULT_API_URL = "http://localhost:5000";

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL;
  if (configured && configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }
  return DEFAULT_API_URL;
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function apiFetch(path, options = {}) {
  const url = buildApiUrl(path);
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to API server at ${getApiBaseUrl()}. ` +
          "Set VITE_API_URL or run backend server on localhost:5000."
      );
    }
    throw error;
  }
}
