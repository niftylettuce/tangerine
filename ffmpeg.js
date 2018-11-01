const path = require('path');
const spawn = require('cross-spawn');
const makeDir = require('make-dir');

const env = require('./env');

const dir = path.resolve(env.RECORDING_DIR, path.basename(env.VIDEO_INPUT));

makeDir.sync(dir);

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
    env.VIDEO_INPUT,
    '-f',
    'alsa',
    '-ar',
    '44100',
    '-i',
    env.AUDIO_INPUT,
    '-f',
    'mpegts',
    '-codec:v',
    'mpeg1video',
    '-s',
    '640x480',
    '-vf',
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
    `http://localhost:${env.STREAM_PORT}`,
    '-f',
    'segment',
    '-segment_time',
    '1800',
    '-strftime',
    '1',
    `${dir}/%Y-%m-%d_%H-%M-%S.avi`
  ],
  { stdio: 'inherit' }
);
