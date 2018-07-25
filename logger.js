const Axe = require('axe');
const consola = require('consola');
const pino = require('pino')();

// <https://github.com/pinojs/pino/issues/460>
pino.log = pino.info;

const logger = new Axe({
  logger: process.env.NODE_ENV === 'production' ? pino : consola,
  capture: false
});

module.exports = logger;
