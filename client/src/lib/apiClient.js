function getBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  // Strip trailing slashes
  const clean = envUrl.replace(/\/+$/, '');
  // If user provided base URL without /api, ensure /api is attached
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

const BASE_URL = getBaseUrl();

/**
 * Universal JSON Fetch Wrapper with robust URL normalization and error handling.
 */
export async function request(endpoint, options = {}) {
  // Strip leading slashes to prevent double slashes (e.g. //syllabus)
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${BASE_URL}/${cleanEndpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${cleanEndpoint}:`, err.message);
    throw err;
  }
}

export default {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),
};
