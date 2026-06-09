import { H as Hls } from "./hls-vendor-dru42stk.js";

export function initPlayer(source) {
  const player = document.querySelector("[data-player]");
  if (!player || !source) {
    return;
  }

  const video = player.querySelector("video");
  const overlay = player.querySelector(".player-overlay");
  let prepared = false;
  let hls = null;

  if (!video) {
    return;
  }

  const hideOverlay = () => {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  };

  const showOverlay = () => {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  };

  const prepareVideo = () => {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const startPlayback = async () => {
    prepareVideo();
    hideOverlay();

    try {
      await video.play();
    } catch (error) {
      showOverlay();
    }
  };

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", () => {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", hideOverlay);

  video.addEventListener("pause", () => {
    if (!video.ended) {
      showOverlay();
    }
  });

  video.addEventListener("ended", showOverlay);

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
