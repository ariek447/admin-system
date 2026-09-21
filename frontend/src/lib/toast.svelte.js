// Cola de notificaciones. El temporizador y la pausa al pasar el ratón viven en ui/Toast.svelte.
export const toasts = $state([]);

let seq = 0;
const MAX_VISIBLE = 4;

export function pushToast(type, message, duration = 5000) {
  const id = ++seq;
  toasts.push({ id, type, message, duration });
  // Si se acumulan, se descartan las más antiguas.
  while (toasts.length > MAX_VISIBLE) toasts.shift();
  return id;
}

export function dismissToast(id) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) toasts.splice(index, 1);
}

export const toast = {
  success: (message, duration) => pushToast('success', message, duration),
  info: (message, duration) => pushToast('info', message, duration),
  warning: (message, duration = 7000) => pushToast('warning', message, duration),
  error: (message, duration = 7000) => pushToast('error', message, duration),
};
