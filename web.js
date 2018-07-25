const path = require('path');
const Server = require('@ladjs/web');
const Graceful = require('@ladjs/graceful');
const render = require('koa-views-render');
const Router = require('koa-router');
const send = require('koa-send');
const Boom = require('boom');

const env = require('./env');
const logger = require('./logger');

const jsmpeg = path.join('node_modules', 'jsmpeg', 'jsmpeg.min.js');
const routes = new Router();

routes.get('/js/vendor/jsmpeg.min.js', async ctx => {
  try {
    await send(ctx, jsmpeg, __dirname);
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

routes.get(
  '/',
  (ctx, next) => {
    ctx.state.width = env.WIDTH;
    ctx.state.height = env.HEIGHT;
    ctx.state.webSocketPort = env.WEBSOCKET_PORT;
    return next();
  },
  render('home')
);

const server = new Server({
  routes,
  logger,
  csrf: false,
  i18n: false,
  views: {
    root: path.join(__dirname, 'views'),
    options: {
      extension: 'pug'
    },
    locals: {
      pretty: true,
      cache: process.env.NODE_ENV !== 'development'
    }
  },
  buildDir: path.join(__dirname, 'assets')
});

if (!module.parent) {
  server.listen(env.WEB_PORT);
  const graceful = new Graceful({ server, logger });
  graceful.listen();
}

module.exports = server;
