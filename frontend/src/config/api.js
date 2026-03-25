export const API_BASE =
  process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5000';

export function adminHeaders() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return {};
    const u = JSON.parse(raw);
    if (!u?.id) return {};
    return { 'X-User-Id': String(u.id) };
  } catch {
    return {};
  }
}
