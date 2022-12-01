const puppeteer = require("puppeteer-core");
const { spawnAsync } = require("./utils");
const path = require("path");
const fs = require("fs").promises;
const axios = require("axios");

const cmdPath = path.join(__dirname + "./../bin/chrome-debugging.bat");

var port = normalizePort(process.env.PORT || "8085");
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
function _sleep(ms) {
  console.log(`Sleeping for ${ms / 1000} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const url = "http://localhost:" + port + "/";
const backendUrl = url + "backend.html";
const pageProvider = {
  connect: async function () {
    browser = await puppeteer.connect({
      browserURL: "http://127.0.0.1:9222",
      defaultViewport: null,
    });
    this.page = await browser.newPage();

    const response = await this.page.goto(backendUrl, {
      waitUntil: "networkidle0",
    });
    this.page.on("domcontentloaded", await this.setup.bind(this));
    return;

    const pages = await browser.pages();
    for (var i = 0; i < pages.length; i++) {
      if (
        await pages[i].evaluate(() => {
          return window.chromeRemote != null;
        })
      ) {
        console.log("connected to existing page");
        this.page = pages[i];
      }
      if (
        pages[i].url().includes("yoursports.stream") ||
        pages[i].url().includes("yrsprts.stream")
      ) {
        this.page = pages[i];
        console.log("connected to: " + pages[i].url());
      }
      if (pages[i].url() == backendUrl) {
        this.page = pages[i];
      }
    }
    if (!this.page) {
      this.page = await browser.newPage();

      const response = await this.page.goto(backendUrl, { waitUntil: "load" });
    }
    //if (this.page) this.page.on("load", await this.setup.bind(this));
    //await this.setup.bind(this);
    //http://yoursports.stream/ing/hockey?v=MjAxNDM5NTQwMQ==
    pageProvider.pageFrame = this.page.pageFrame;
    const iframeElement = await pageProvider.page.$('iframe[name="tmaplayer"');
    const map = iframeElement._frameManager._frames;
    //console.log("frames", map);
    map.forEach((v) => {
      if (v.url().includes("http://yoursports.stream/ing/hockey")) {
        console.log("setting page frame...");
        pageProvider.pageFrame = v;
      }
    });
    await this.setup();
  },
  page: null,
  pageFrame: null,
  setup: async function () {
    //this.pageFrame = this.page;
    //inject javascript detector
    const mediaDetectorContent = await axios({
      url: url + "puppeteer/media-detector.js",
      method: "GET",
    });

    // await pageProvider.page.addScriptTag({
    //   url: url + "puppeteer/media-detector.js",
    // });
    await pageProvider.page.addScriptTag({
      content: mediaDetectorContent.data,
    });
    if ((await pageProvider.page.url()).includes("racepass")) {
      await _sleep(6000);
    } else {
      await _sleep(2000);
    }
    var script = await pageProvider.page.evaluate(() => {
      return mediaDetector.detect();
    });
    //script = "video-adapter.js";
    if (script) {
      console.log("connected to: " + pageProvider.page.url());
      console.log("Injecting: " + script);
      //split script on #
      const res = script.split("***");
      //if 2 segments then set pageFrame to selector of first segment, set script to second segment
      if (res.length > 1) {
        script = res[2];
        const iframeElement = await pageProvider.page.$(res[0]);
        const map = iframeElement._frameManager._frames;
        map.forEach((v) => {
          if (v.url() == res[1]) {
            pageProvider.pageFrame = v;
          }
        });
        if (pageProvider.pageFrame == null) {
          console.log(
            "Embedded iframe not found. Did you start Google Chrome with the following flags? --disable-features=IsolateOrigins,site-per-process"
          );
          return;
        }
      } else {
        pageProvider.pageFrame = pageProvider.page;
      }
      const controllerJs = await axios({
        url: url + "puppeteer/" + script,
        method: "GET",
      });
      await pageProvider.pageFrame.addScriptTag({
        content: controllerJs.data,
      });
    } else {
      console.log(
        "Chrome Remote media-detector.js could not detect a supported player."
      );
      return;
    }
  },
  init: async function () {
    try {
      await this.connect();
    } catch (e) {
      //const result = await execShellCommand(cmdPath)
      try {
        await spawnAsync("cmd.exe", ["/c", cmdPath]);
        //await spawnAsync(cmdPath);
        await this.connect();
      } catch (e) {
        console.log(e);
        console.log(
          "TIP: Make sure all chrome.exe instances are closed so that chrome can start with remote debugging enabled."
        );
      }
    }
  },
};
//pageProvider.init();

module.exports = pageProvider;
