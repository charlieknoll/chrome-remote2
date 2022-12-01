let chromeRemotePlayer = function () {
  return jwplayer();
};
var chromeRemote = {
  play: function () {
    chromeRemotePlayer().play();
  },
  pause: function () {
    chromeRemotePlayer().pause();
  },
  seek: function (t) {
    chromeRemotePlayer().seek(
      chromeRemotePlayer().getCurrentTime() + parseInt(t)
    );
  },
  getCurrentTimeDisplay: function () {
    return (
      parseInt(chromeRemotePlayer().getCurrentTime()) +
      " / " +
      parseInt(chromeRemotePlayer().getDuration())
    );
  },
  toggleFullScreen: function () {
    chromeRemotePlayer().setFullscreen(!chromeRemotePlayer().getFullscreen());
    // document
    //   .querySelector("#player")
    //   .querySelector("button[data-fullscreen]")
    //   .click();
  },
};

//Clear ad box
window.setTimeout(() => {
  console.log("playing...");
  document.querySelector("#player img[onclick]").click();
  chromeRemote.play();
  chromeRemote.toggleFullScreen();
}, 2000);
