const { createServer } = require('http');
const { Server } = require('ws');
const async = require('async');
const ip = require('ip');

const env = require('./env');
const logger = require('./logger');

const wss = new Server({ port: env.WEBSOCKET_PORT, perMessageDeflate: false });

// inspired by <https://github.com/tahaipek/Nodcam>
wss.on('connection', socket => {
  socket.on('close', (code, message) => {
    let log = `socket closed with code ${code}`;
    if (message) log += ` and message "${message}"`;
    logger.info(log);
  });
});

if (env.AUTH_NAME || env.AUTH_PASS)
  wss.on('upgrade', (req, socket) => {
    try {
      if (
        !req.headers.authorization ||
        req.headers.authorization !==
          Buffer.from(`Basic ${env.AUTH_NAME}:${env.AUTH_PASS}`).toString(
            'base64'
          )
      )
        socket.destroy();
    } catch (err) {
      logger.error(err);
    }
  });

wss.broadcast = function(data, opts) {
  async.each(
    wss.clients,
    (client, fn) => {
      if (client.readyState !== 1) {
        logger.error(
          `socket client is not connected and will not receive broadcast`
        );
        return fn();
      }
      client.send(data, opts, err => {
        if (err) {
          err.message = `socket client had an error: ${err.message}`;
          logger.error(err);
        }
        fn();
      });
    },
    () => {
      logger.debug(`web socket server broadcasted data successfully`);
    }
  );
};

const server = createServer((req, res) => {
  // TODO: when we add password/secret we need to `req.end();` early
  res.connection.setTimeout(0);
  req.on('data', data => {
    console.log('data', data);
    wss.broadcast(data);
  });
});

if (!module.parent)
  server.listen(env.STREAM_PORT, function() {
    const { port } = this.address();
    logger.info(
      `stream server listening on ${port} (LAN: ${ip.address()}:${port})`
    );
  });

module.exports = server;
