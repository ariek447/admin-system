import { request, getToken, setToken, clearToken, setUnauthorizedHandler } from './api.js';
import { toast } from './toast.svelte.js';

// status: 'checking' (validando token guardado) | 'anonymous' | 'authenticated'
export const auth = $state({ status: 'checking', token: null, user: null });

const setSession = (token, user) => {
  setToken(token);
  auth.token = token;
  auth.user = user;
  auth.status = 'authenticated';
};

// Se llama una vez al cargar la app: valida el token guardado contra /users/me.
export async function init() {
  const token = getToken();
  if (!token) {
    auth.status = 'anonymous';
    return;
  }

  try {
    const { user } = await request('/users/me', { token });
    auth.token = token;
    auth.user = user;
    auth.status = 'authenticated';
  } catch (err) {
    // Token vencido o usuario borrado: se descarta. Un fallo de red conserva el token.
    if (err.status === 401 || err.status === 404) clearToken();
    auth.status = 'anonymous';
  }
}

export async function login(email, password) {
  const { token, user } = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null,
  });
  setSession(token, user);
}

// El backend no devuelve token al registrar, así que se inicia sesión a continuación.
export async function register(name, email, password) {
  await request('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    token: null,
  });
  await login(email, password);
}

export function logout() {
  clearToken();
  auth.token = null;
  auth.user = null;
  auth.status = 'anonymous';
}

// Cuando un admin edita su propia cuenta, la sesión debe reflejar los datos nuevos.
export function setSessionUser(user) {
  if (auth.status === 'authenticated') auth.user = user;
}

// Vuelve a leer al usuario actual: el rol pudo cambiar desde otra sesión (por ejemplo,
// que te degraden mientras usas el panel).
export async function refreshSession() {
  try {
    const { user } = await request('/users/me');
    setSessionUser(user);
  } catch {
    /* si falla por 401, el manejador global ya cerró la sesión */
  }
}

// Token caducado o inválido en mitad de una sesión: se cierra y se avisa.
setUnauthorizedHandler(() => {
  if (auth.status !== 'authenticated') return;
  logout();
  toast.warning('Tu sesión expiró. Inicia sesión de nuevo.');
});
