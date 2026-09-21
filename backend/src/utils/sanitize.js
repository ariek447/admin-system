// Devuelve una copia del usuario sin el campo password.
const sanitizeUser = (user) => {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
};

module.exports = { sanitizeUser };
