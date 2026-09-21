const supabase = require('../config/supabase');
const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ error: message });
  }
};

// El rol se lee de la base de datos en cada petición y no del JWT: así, degradar o
// eliminar a un admin le quita el acceso al instante, sin esperar a que caduque su token.
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }
  if (data.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }

  req.user.role = data.role;
  return next();
};

// Para rutas que un usuario puede consultar sobre sí mismo (req.params.id) y un admin sobre cualquiera.
const requireAdminOrSelf = (req, res, next) => {
  if (req.user && req.params.id === req.user.id) return next();
  return requireAdmin(req, res, next);
};

module.exports = { authenticate, requireAdmin, requireAdminOrSelf };
