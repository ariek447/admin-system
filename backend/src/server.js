require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`API escuchando en http://${HOST}:${PORT}/api`);
});
