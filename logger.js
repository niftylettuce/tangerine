const Axe = require('axe');
const consola = require('consola');
const pino = require('pino')();

// <https://github.com/pinojs/pino/issues/460>
pino.addLevel('log', 30);

const logger = new Axe({
  logger: process.env.NODE_ENV === 'production' ? pino : consola,
  capture: false
});

module.exports = logger;
