const dateFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' });

const toDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (iso) => {
  const d = toDate(iso);
  return d ? dateFmt.format(d) : '—';
};

export const formatDateTime = (iso) => {
  const d = toDate(iso);
  return d ? dateTimeFmt.format(d) : '—';
};

// "Ana María Pérez" -> "AP"; "Ana" -> "A"
export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const hash = (text) => {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
};

// Dos colores estables derivados del email. La luminosidad es baja para que las iniciales
// blancas se lean bien con cualquier tono.
export const avatarColors = (email = '') => {
  const hue = hash(email.trim().toLowerCase()) % 360;
  return [`hsl(${hue} 65% 46%)`, `hsl(${(hue + 45) % 360} 65% 34%)`];
};

export const ROLE_LABELS = { admin: 'Administrador', user: 'Usuario' };
