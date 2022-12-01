const puppeteer = require("puppeteer-core");
const axios = require("axios");

const port = "8085";
const url = "http://localhost:" + port + "/";

let browser;
let page;
let pageFrame;
function _sleep(ms) {
  console.log(`Sleeping for ${ms / 1000} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const detectAndInject = async function (mediaDetectorContent) {
  try {
    await pageFrame.addScriptTag({
      content: mediaDetectorContent.data,
    });
  } catch (err) {
    console.log(err);
  }
  await _sleep(200);
  var script = await pageFrame.evaluate(() => {
    return mediaDetector.detect();
  });
  if (script) {
    console.log("Injecting: " + script);
    const res = script.split("***");
    //if 2 segments then set pageFrame to selector of first segment, set script to second segment
    if (res.length > 1) {
      script = res[2];
      const iframeElement = await pageFrame.$(res[0]);
      pageFrame = await iframeElement.contentFrame();
      // const map = iframeElement._frameManager._frames;
      // map.forEach((v) => {
      //   if (v.url() == res[1]) {
      //     pageFrame = v;
      //   }
      // });
    } else {
      pageFrame = page;
    }
    const controllerJs = await axios({
      url: url + "puppeteer/" + script,
      method: "GET",
    });
    await pageFrame.addScriptTag({
      content: controllerJs.data,
    });
  } else {
    console.log(
      "Chrome Remote media-detector.js could not detect a supported player."
    );
  }
  let result = await pageFrame.$("video");
  if (result) {
    let result = await validate();
  }
  return result;
};
const validate = async function () {
  try {
    await pageFrame.evaluate(() => {
      chromeRemote.play();
    });
    return true;
  } catch (err) {
    return false;
  }
};
const connect = async function () {
  console.log("Connecting...");
  browser = await puppeteer.connect({
    browserURL: "http://127.0.0.1:9222",
    defaultViewport: null,
  });
  page = undefined;
  const pages = await browser.pages();
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].url().includes("roystream.com")) {
      page = pages[i];
      console.log("connected to: " + pages[i].url());
    }
  }
  if (!page) {
    console.log(
      "Could not connect, be sure to have a roystream.com window open with debug tools"
    );
    return;
  }
  page.on("console", (message) =>
    console.log(
      `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
    )
  );

  const mediaDetectorContent = await axios({
    url: url + "puppeteer/media-detector.js",
    method: "GET",
  });
  pageFrame = page.mainFrame();

  var result = await detectAndInject(mediaDetectorContent);
  let ct = 0;
  while (!result && ct < 5) {
    result = await detectAndInject(mediaDetectorContent);
    ct++;
  }
  await _sleep(500);
};

const pageFrameProvider = async function () {
  if (pageFrame && !pageFrame.isDetached()) return pageFrame;
  if (pageFrame) {
    pageFrame = undefined;
    console.log("Detached");
  }

  await connect();
  return pageFrame;
};

module.exports = pageFrameProvider;
