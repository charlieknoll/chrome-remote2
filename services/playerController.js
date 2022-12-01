const pageFrameProvider = require("./pageFrameProvider");

const playerController = {
  seek: async function (t) {
    const prov = await pageFrameProvider();
    await prov.evaluate((t) => {
      chromeRemote.seek(t);
    }, t);
  },
  play: async function () {
    const prov = await pageFrameProvider();
    try {
      await prov.evaluate(() => {
        debugger;
        chromeRemote.play();
      });
    } catch (err) {
      console.log(err);
    }
  },
  pause: async function () {
    const prov = await pageFrameProvider();
    await prov.evaluate(() => {
      chromeRemote.pause();
    });
  },
  status: async function () {
    const prov = await pageFrameProvider();

    const result = await prov.evaluate(() => {
      return {
        currentTimeDisplay: chromeRemote.getCurrentTimeDisplay(),
      };
    });
    return result;
  },
  toggle: async function () {
    const prov = await pageFrameProvider();
    await prov.evaluate(() => {
      chromeRemote.toggleFullScreen();
    });
  },
  channel: async function (url) {},
};
module.exports = playerController;
