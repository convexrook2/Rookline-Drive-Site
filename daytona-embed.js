(() => {
  const frame = document.querySelector('#daytona-race-replay iframe');
  if (!frame) return;
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.type !== 'drive:daytona-replay-size') return;
    const height = event.data.height;
    if (Number.isFinite(height) && height >= 200 && height <= 1400) frame.height = String(Math.ceil(height));
  });
})();
