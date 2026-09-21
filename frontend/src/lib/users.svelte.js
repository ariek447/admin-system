// Estado y operaciones de la administración de usuarios. Solo lo importa UsersView, que a su vez
// solo se carga (import dinámico) para admins: un usuario normal nunca ejecuta este módulo.
import { request, ApiError } from './api.js';
import { auth, setSessionUser, refreshSession } from './auth.svelte.js';

const SEARCH_DEBOUNCE_MS = 300;

const isAdmin = () => auth.user?.role === 'admin';

export const users = $state({
  items: [],
  total: 0,
  limit: 20,
  offset: 0,
  search: '',
  loading: false,
  error: null, // error de carga de la lista (los de create/update/delete los lanzan las funciones)
});

let requestSeq = 0; // descarta respuestas viejas si el usuario escribe o pagina rápido
let searchTimer;

export const pageInfo = () => ({
  page: Math.floor(users.offset / users.limit) + 1,
  pageCount: Math.max(1, Math.ceil(users.total / users.limit)),
  from: users.items.length ? users.offset + 1 : 0,
  to: users.offset + users.items.length,
});

export async function fetchUsers() {
  // Segunda barrera: aunque alguien llegue aquí sin ser admin, no se llama a la API.
  if (!isAdmin()) return;

  const mine = ++requestSeq;
  users.loading = true;
  users.error = null;

  const params = new URLSearchParams({ limit: String(users.limit), offset: String(users.offset) });
  const search = users.search.trim();
  if (search) params.set('search', search);

  try {
    const data = await request(`/users?${params}`);
    if (mine !== requestSeq) return;

    // Tras borrar o filtrar, la página actual puede quedar más allá del final.
    if (!data.users.length && data.total > 0 && users.offset > 0) {
      users.offset = (Math.ceil(data.total / users.limit) - 1) * users.limit;
      return fetchUsers();
    }

    users.items = data.users;
    users.total = data.total;
  } catch (err) {
    if (mine !== requestSeq) return;
    // 403: ya no eres admin. Se refresca la sesión y el layout te lleva al perfil.
    if (err.status === 403) await refreshSession();
    users.error = err.message;
  } finally {
    if (mine === requestSeq) users.loading = false;
  }
}

export function setSearch(text) {
  users.search = text;
  users.offset = 0;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchUsers, SEARCH_DEBOUNCE_MS);
}

export function goToPage(page) {
  const { pageCount } = pageInfo();
  const target = Math.min(Math.max(page, 1), pageCount);
  users.offset = (target - 1) * users.limit;
  return fetchUsers();
}

export const nextPage = () => goToPage(pageInfo().page + 1);
export const prevPage = () => goToPage(pageInfo().page - 1);

// Un solo POST: el usuario nace con su rol (sin PATCH posterior).
export async function createUser({ name, email, password, role }) {
  const { user } = await request('/users', {
    method: 'POST',
    body: { name, email, password, role },
  });
  await fetchUsers();
  return user;
}

// `original` es el usuario tal como está en la lista. Hace PUT solo si cambió nombre o email,
// y PATCH solo si cambió el rol.
export async function updateUser(original, { name, email, role }) {
  const isSelf = original.id === auth.user?.id;
  const profileChanged = name !== original.name || email.toLowerCase() !== original.email;
  const roleChanged = role !== original.role;

  if (roleChanged && isSelf) {
    throw new ApiError('No puedes cambiar tu propio rol', 403);
  }

  let user = original;

  if (profileChanged) {
    ({ user } = await request(`/users/${original.id}`, { method: 'PUT', body: { name, email } }));
    if (isSelf) setSessionUser(user);
  }

  if (roleChanged) {
    try {
      ({ user } = await request(`/users/${original.id}/role`, { method: 'PATCH', body: { role } }));
    } catch (err) {
      // Los datos del PUT ya están guardados: se refresca la lista y se avisa con claridad.
      await fetchUsers();
      if (profileChanged) {
        const partial = new ApiError(
          `Se guardaron el nombre y el email, pero el rol no cambió: ${err.message}`,
          err.status,
        );
        partial.partial = true;
        throw partial;
      }
      throw err;
    }
  }

  await fetchUsers();
  return user;
}

export async function deleteUser(user) {
  if (user.id === auth.user?.id) {
    throw new ApiError('No puedes eliminar tu propia cuenta', 403);
  }
  await request(`/users/${user.id}`, { method: 'DELETE' });
  await fetchUsers();
}

export function resetUsers() {
  clearTimeout(searchTimer);
  requestSeq++; // invalida cualquier respuesta en vuelo
  users.items = [];
  users.total = 0;
  users.offset = 0;
  users.search = '';
  users.loading = false;
  users.error = null;
}
