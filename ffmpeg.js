const spawn = require('cross-spawn');

const env = require('./env');

spawn.sync(
  'ffmpeg',
  [
    '-f',
    'v4l2',
    '-framerate',
    '25',
    '-video_size',
    `${env.WIDTH}x${env.HEIGHT}`,
    '-i',
    env.INPUT,
    '-f',
    'alsa',
    '-ar',
    '44100',
    '-i',
    env.INPUT,
    '-f',
    'mpegts',
    '-codec:v',
    'mpeg1video',
    '-s',
    '640x480',
    '-b:v',
    '1000k',
    '-bf',
    '0',
    '-codec:a',
    'mp2',
    '-b:a',
    '128k',
    '-muxdelay',
    '0.001',
    `http://localhost:${env.STREAM_PORT}`
  ],
  { stdio: 'inherit' }
);
