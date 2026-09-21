const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const TOKEN_KEY = 'admin_token';

export class ApiError extends Error {
  constructor(message, status = 0, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// localStorage puede lanzar (modo privado, datos bloqueados): la app debe seguir funcionando.
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* sin persistencia */
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* sin persistencia */
  }
};

// Lo registra auth.svelte.js (así api.js no depende de auth y se evita un import circular).
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

export async function request(path, { method = 'GET', body, token = getToken() } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Un 401 con un token enviado significa sesión caducada o inválida. Un 401 del login
    // (que va con token: null) son credenciales incorrectas y no debe cerrar nada.
    if (res.status === 401 && token) unauthorizedHandler?.();

    const details = Array.isArray(data.details) ? data.details : [];
    const message = details.length
      ? details.map((d) => d.message).join('. ')
      : data.error || 'Ocurrió un error inesperado';
    throw new ApiError(message, res.status, details);
  }

  return data;
}
