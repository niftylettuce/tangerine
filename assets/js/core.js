(() => {
  const canvas = document.getElementById('video');
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const textString = 'Loading...';

  let isRetina = false;

  if (window.matchMedia) {
    const mq = window.matchMedia(
      `only screen and (min--moz-device-pixel-ratio: 1.3), only screen and
      (-o-min-device-pixel-ratio: 2.6/2), only screen and
      (-webkit-min-device-pixel-ratio: 1.3), only screen
      and (min-device-pixel-ratio: 1.3), only screen and
      (min-resolution: 1.3dppx)`
    );
    isRetina = (mq && mq.matches) || window.devicePixelRatio > 1;
  }

  if (isRetina) {
    canvas.width *= 2;
    canvas.height *= 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext('2d').scale(2, 2);
  }

  ctx.fillStyle = '#fff';
  ctx.font = '48px Arial';

  const measureText = ctx.measureText(textString);

  ctx.fillText(textString, width / 2 - measureText.width / 2, height / 2);

  const player = new JSMpeg.Player(
    `ws://${document.location.hostname}:${window.webSocketPort}`,
    {
      canvas,
      disableGl: true
    }
  );

  function onUnlocked() {
    player.volume = 1;
    document.removeEventListener('touchstart', onTouchStart);
  }

  function onTouchStart() {
    player.audioOut.unlock(onUnlocked);
    document.removeEventListener('touchstart', onTouchStart);
  }

  player.audioOut.unlock(onUnlocked);
  document.addEventListener('touchstart', onTouchStart, false);
})();
