const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://56.228.15.52:3001/api';

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('lims-auth');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state && parsed.state.token) {
        headers['Authorization'] = `Bearer ${parsed.state.token}`;
      }
    } catch (e) {}
  }
  return headers;
};

export const api = {
  get: async (endpoint: string, signal?: AbortSignal) => {
    const res = await fetch(`${API_BASE}${endpoint}`, { headers: getHeaders(), signal });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  patch: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
