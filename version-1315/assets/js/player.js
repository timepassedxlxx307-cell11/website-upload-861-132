import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(container) {
  var video = container.querySelector('video');
  var cover = container.querySelector('.player-cover');
  var message = container.querySelector('.player-message');
  var hls = null;
  var started = false;

  function showMessage() {
    if (message) {
      message.hidden = false;
    }
  }

  function play() {
    if (!video || !cover || started) {
      if (video) {
        video.play().catch(showMessage);
      }
      return;
    }

    var address = cover.value;
    started = true;
    cover.hidden = true;

    if (message) {
      message.hidden = true;
    }

    if (hls) {
      hls.destroy();
      hls = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = address;
      video.play().catch(showMessage);
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(address);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(showMessage);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
        showMessage();
      });
      return;
    }

    showMessage();
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        play();
      }
    });
  }
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
