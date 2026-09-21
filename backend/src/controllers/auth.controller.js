const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const { SALT_ROUNDS, hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/sanitize');

const UNIQUE_VIOLATION = '23505';

// Hash de relleno para que el login tarde lo mismo exista o no el email.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const hashed = await hashPassword(password);

  const { data: user, error } = await supabase
    .from('users')
    // El rol nunca se toma del body: todo registro público entra como 'user' (default de la BD).
    .insert({ email, password: hashed, name })
    .select('id, email, name, role, created_at')
    .single();

  if (error) {
    // Carrera entre dos registros simultáneos con el mismo email.
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    throw error;
  }

  return res.status(201).json({ user: sanitizeUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role, password, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;

  const valid = await comparePassword(password, user ? user.password : DUMMY_HASH);

  if (!user || !valid) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = signToken(user);
  return res.json({ token, user: sanitizeUser(user) });
};

module.exports = { register, login };
