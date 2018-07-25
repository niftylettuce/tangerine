const { createServer } = require('http');
const { Server } = require('ws');
const async = require('async');
const ip = require('ip');

const env = require('./env');
const logger = require('./logger');

const wss = new Server({ port: env.WEBSOCKET_PORT, perMessageDeflate: false });

// inspired by <https://github.com/tahaipek/Nodcam>
wss.on('connection', socket => {
  /*
  const header = Buffer.alloc(8);
  header.write('jsmp');
  header.writeUInt16BE(env.WIDTH, 4);
  header.writeUInt16BE(env.HEIGHT, 6);
  socket.send(header, { binary: true });
  */
  socket.on('close', (code, message) => {
    let log = `socket closed with code ${code}`;
    if (message) log += ` and message "${message}"`;
    logger.info(log);
  });
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
    // wss.broadcast(data, { binary: true });
    wss.broadcast(data);
    // TODO: add ability to record?
    // <https://github.com/phoboslab/jsmpeg/blob/master/websocket-relay.js#L70>
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
