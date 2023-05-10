// TODO: should create function encode body before send
'use strict';
let isPrivateBrowsing = false;
let oldUrl = window.document.referrer;
let userAgent = '';
let ip = '';
let logId = null;
let newScroll = 0;
let oldScroll = 0;
let newTimeOnPage = 0;
let oldTimeOnPage = 0;
let oldHref = "";
let newHref = "";
let uuid = createUUID();
let isClick = true;
let dosiInfo = "";
const intervalTime = 4000; // ms

let browserResolution = {
  width: window.outerWidth,
  height: window.outerHeight
};

let screenResolution = {
  width: screen.width,
  height: screen.height
};

const init = async () => {
  //tracking time on page
  TimeMe.initialize({
    currentPageName: "my-home-page", // current page
    idleTimeoutInSeconds: 5 // seconds
  });

  //detectScroll
  setInterval( async () => {
    getScrollPercentage();
    await detectScroll();
  }, 3000);

  //get ip
  ip = await getIp();
  // get is Private Browsing.
  await checkPrivate();
  //get userAgent.
  userAgent = window.navigator.userAgent;

  window.onunload = function(e) {
    e.preventDefault();
    onUnload(e);
    return false;
  };

  //check next page on single page
  window.addEventListener("click", async () => {
    if(dosiInfo != getLocalStorage(CONFIG.localStorageDosi)){
      updateUser();
    }

    isClick = false;
    await log();
  });

  //save logs
  await log();

  setInterval(onUnload, intervalTime); // interval check time on page
};

loadMultiFiles(
  [
    window.$ ? null : {filename: 'https://code.jquery.com/jquery-1.12.4.min.js', filetype: 'js'},
    {filename: `https://static.dosi-in.com/var/viewer_js/timeme.min.js`, filetype: 'js'}
  ]
).then(init);