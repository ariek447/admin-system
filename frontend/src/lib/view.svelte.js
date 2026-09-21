import { auth } from './auth.svelte.js';

// Vista actual del panel: 'users' (solo admin) o 'profile'.
// Es estado simple: al recargar la página se vuelve a la vista por defecto.
export const view = $state({ current: 'profile' });

const isAdmin = () => auth.user?.role === 'admin';

// La interfaz nunca ofrece 'users' a un no-admin; el backend lo bloquea igualmente con 403.
export function setView(name) {
  view.current = name === 'users' && !isAdmin() ? 'profile' : name;
}

export function resetView() {
  view.current = isAdmin() ? 'users' : 'profile';
}
