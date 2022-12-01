var mediaDetector = {
  detect: function () {
    if (window.nbcsplayer != undefined) return "nbcsports-adapter.js";
    var iframeEl = document.querySelectorAll(
      "iframe[allow='encrypted-media']"
    )[0];
    //return 'test'
    if (iframeEl) {
      //var iframeEl = document.querySelector("#playerGame > iframe");
      return (
        "iframe[allow='encrypted-media']***" +
        iframeEl.src +
        "***video-adapter.js"
      );
    }
    //if (player.contentWindow.bitmovin != undefined)
    //return "ys-bitmovin-adapter.js";
    //if (player.contentWindow.player != undefined)
    var iframeEl = document.querySelector("iframe[name='tmaplayer']");
    if (iframeEl) {
      return (
        "iframe[name='tmaplayer']#" + iframeEl.src + "#ys-player-adapter.js"
      );
    }
    player = document.getElementsByTagName("video")[0];
    if (player) {
      return "video-adapter.js";
    }
    return false;
  },
};
