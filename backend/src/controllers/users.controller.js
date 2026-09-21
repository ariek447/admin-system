const supabase = require('../config/supabase');
const { sanitizeUser } = require('../utils/sanitize');
const { hashPassword } = require('../utils/password');
const { buildSearchFilter } = require('../utils/search');

// Columnas explícitas: `password` nunca se pide a la base de datos en estos endpoints.
const USER_COLUMNS = 'id, email, name, role, created_at';

const UNIQUE_VIOLATION = '23505';
const OFFSET_OUT_OF_RANGE = 'PGRST103';

const DEFAULT_LIMIT = 20;

// Lo lanza el trigger prevent_last_admin_loss (ver migrations/001_add_role.sql).
const isLastAdminError = (error) => Boolean(error?.message?.includes('LAST_ADMIN'));

const lastAdminResponse = (res) =>
  res.status(409).json({ error: 'No se puede eliminar ni degradar al último administrador' });

const notFound = (res) => res.status(404).json({ error: 'Usuario no encontrado' });

const me = async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!user) return notFound(res);

  return res.json({ user: sanitizeUser(user) });
};

const withSearch = (query, search) => {
  const filter = buildSearchFilter(search);
  return filter ? query.or(filter) : query;
};

const list = async (req, res) => {
  const limit = Number(req.query.limit ?? DEFAULT_LIMIT);
  const offset = Number(req.query.offset ?? 0);
  const { search } = req.query;

  const { data, count, error } = await withSearch(
    supabase.from('users').select(USER_COLUMNS, { count: 'exact' }),
    search,
  )
    // Orden ascendente y con desempate por id: la paginación no se descoloca al registrarse gente.
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error?.code === OFFSET_OUT_OF_RANGE) {
    // Un offset más allá del final no es un error para el cliente: devuelve una página vacía.
    // El total debe respetar el mismo filtro de búsqueda.
    const { count: total, error: countError } = await withSearch(
      supabase.from('users').select('id', { count: 'exact', head: true }),
      search,
    );
    if (countError) throw countError;
    return res.json({ users: [], total, limit, offset });
  }
  if (error) throw error;

  return res.json({ users: data.map(sanitizeUser), total: count, limit, offset });
};

// Alta hecha por un admin: a diferencia de /auth/register, permite fijar el rol desde el inicio.
const create = async (req, res) => {
  const { email, password, name, role = 'user' } = req.body;

  const hashed = await hashPassword(password);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email, password: hashed, name, role })
    .select(USER_COLUMNS)
    .single();

  if (error) {
    // Se confía en el índice único (sin select previo) para no tener carreras entre peticiones.
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    throw error;
  }

  return res.status(201).json({ user: sanitizeUser(user) });
};

const getById = async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!user) return notFound(res);

  return res.json({ user: sanitizeUser(user) });
};

const update = async (req, res) => {
  const { email, name } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .update({ email, name })
    .eq('id', req.params.id)
    .select(USER_COLUMNS)
    .maybeSingle();

  if (error) {
    // Se confía en el índice único (sin select previo) para no tener carreras entre peticiones.
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    throw error;
  }
  if (!user) return notFound(res);

  return res.json({ user: sanitizeUser(user) });
};

const changeRole = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(403).json({ error: 'No puedes cambiar tu propio rol' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ role: req.body.role })
    .eq('id', req.params.id)
    .select(USER_COLUMNS)
    .maybeSingle();

  if (error) {
    if (isLastAdminError(error)) return lastAdminResponse(res);
    throw error;
  }
  if (!user) return notFound(res);

  return res.json({ user: sanitizeUser(user) });
};

const remove = async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(403).json({ error: 'No puedes eliminar tu propia cuenta' });
  }

  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', req.params.id)
    .select('id');

  if (error) {
    if (isLastAdminError(error)) return lastAdminResponse(res);
    throw error;
  }
  if (!data.length) return notFound(res);

  return res.status(204).send();
};

module.exports = { me, list, create, getById, update, changeRole, remove };
