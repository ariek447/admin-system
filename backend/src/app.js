const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
