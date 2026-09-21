const { body, param, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    error: 'Datos inválidos',
    details: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

const emailRule = body('email')
  .isString()
  .withMessage('El email es requerido')
  .trim()
  .isEmail()
  .withMessage('Email inválido')
  .normalizeEmail({ gmail_remove_dots: false });

// bcrypt solo procesa los primeros 72 bytes, por eso el máximo.
const passwordRule = body('password')
  .isString()
  .withMessage('La contraseña es requerida')
  .isLength({ min: 8 })
  .withMessage('La contraseña debe tener al menos 8 caracteres')
  .isLength({ max: 72 })
  .withMessage('La contraseña no puede superar 72 caracteres');

const nameRule = body('name')
  .isString()
  .withMessage('El nombre es requerido')
  .trim()
  .isLength({ min: 1, max: 100 })
  .withMessage('El nombre debe tener entre 1 y 100 caracteres');

const validateRegister = [emailRule, passwordRule, nameRule, handleValidation];

// En login no se valida la longitud mínima para no filtrar la política de contraseñas.
const validateLogin = [
  emailRule,
  body('password').isString().notEmpty().withMessage('La contraseña es requerida'),
  handleValidation,
];

const ROLES = ['admin', 'user'];

const validateUserId = [
  param('id').isUUID().withMessage('ID de usuario inválido'),
  handleValidation,
];

// Solo valida: los valores por defecto, el recorte del texto y la conversión a número
// se hacen en el controlador (en Express 5 req.query es de solo lectura).
// Un `search` repetido (?search=a&search=b) llega como array y no pasa isString.
const validateListUsers = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un entero entre 1 y 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset debe ser un entero mayor o igual a 0'),
  query('search')
    .optional()
    .isString()
    .withMessage('search debe ser un texto')
    .isLength({ max: 100 })
    .withMessage('search no puede superar 100 caracteres'),
  handleValidation,
];

const roleRule = body('role')
  .isString()
  .isIn(ROLES)
  .withMessage(`El rol debe ser uno de: ${ROLES.join(', ')}`);

// PUT reemplaza el recurso: name y email son obligatorios. La contraseña no se cambia desde aquí.
const validateUpdateUser = [emailRule, nameRule, handleValidation];

const validateChangeRole = [roleRule, handleValidation];

// POST /users: `role` es opcional (el controlador usa 'user' por defecto), pero si viene debe ser válido.
const validateCreateUser = [
  emailRule,
  passwordRule,
  nameRule,
  body('role')
    .optional()
    .isString()
    .isIn(ROLES)
    .withMessage(`El rol debe ser uno de: ${ROLES.join(', ')}`),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUserId,
  validateListUsers,
  validateCreateUser,
  validateUpdateUser,
  validateChangeRole,
};
