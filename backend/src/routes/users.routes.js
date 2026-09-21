const { Router } = require('express');
const users = require('../controllers/users.controller');
const { authenticate, requireAdmin, requireAdminOrSelf } = require('../middlewares/auth.middleware');
const {
  validateUserId,
  validateListUsers,
  validateCreateUser,
  validateUpdateUser,
  validateChangeRole,
} = require('../middlewares/validate.middleware');

const router = Router();

// Orden de los middlewares: authenticate -> permisos -> validación -> controlador.
// `/me` debe ir antes que `/:id`, o Express lo trataría como un id.
router.get('/me', authenticate, users.me);

router.get('/', authenticate, requireAdmin, validateListUsers, users.list);
router.post('/', authenticate, requireAdmin, validateCreateUser, users.create);
router.get('/:id', authenticate, validateUserId, requireAdminOrSelf, users.getById);
router.put('/:id', authenticate, requireAdmin, validateUserId, validateUpdateUser, users.update);
router.patch('/:id/role', authenticate, requireAdmin, validateUserId, validateChangeRole, users.changeRole);
router.delete('/:id', authenticate, requireAdmin, validateUserId, users.remove);

module.exports = router;
