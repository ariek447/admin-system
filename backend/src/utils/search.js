// Construye el filtro `.or()` de PostgREST para buscar por nombre o email.
//
// El texto del usuario acaba dentro de una cadena con sintaxis propia, donde las comas,
// paréntesis y puntos tienen significado: sin protegerlo, `a),role.eq.admin` alteraría la
// consulta. Por eso se aplican dos escapes, en este orden:
//   1. LIKE: `%`, `_` y `\` se escapan para que se busquen literalmente ("50%" no casa con todo).
//   2. PostgREST: el patrón entero va entre comillas dobles, escapando `"` y `\`.

const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

const quote = (text) => `"${text.replace(/[\\"]/g, '\\$&')}"`;

// Devuelve null si no hay nada que buscar.
const buildSearchFilter = (raw) => {
  const term = typeof raw === 'string' ? raw.trim() : '';
  if (!term) return null;

  const pattern = quote(`%${escapeLike(term)}%`);
  return `name.ilike.${pattern},email.ilike.${pattern}`;
};

module.exports = { buildSearchFilter };
