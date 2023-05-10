(function(){'use strict';
const CONFIG = {
  hostApi: '//viewer.backend.dosi-in.vn',
  localStorageDosi: '_dosi_info_viewer'
};;
const APIs = {
  log: CONFIG.hostApi + '/api/user-behaviors/log',
  timeUnload: CONFIG.hostApi + '/api/user-behaviors/log/:id/time-unload',
  scrollPercentage: CONFIG.hostApi + '/api/user-behaviors/log/:id/scroll-percentage',
  updateUserInfo: CONFIG.hostApi + '/api/user-info/:id/'
};;
const createUUID = () => {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt/16);
      return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};;
const detectScroll = async() => {
  try{
    if(logId)
    {
      if(newScroll > oldScroll)
      {
        oldScroll = newScroll;
        
        const url = APIs.scrollPercentage.replace(':id', logId);
        const body = {
          scroll: newScroll
        };
    
        $.ajax({
          type: 'PUT',
          async: true,
          url: url,
          data: body
        });
      }
    }
  }catch(e){
    return;
  }
};;
const getIp = async () => {
  try{
    const res = await fetch('https://api64.ipify.org/?format=json');
    const data = await res.json();

    if(!data){
      return "";
    }

    return data.ip ? data.ip : "";
  }catch(e){
    return "";
  }
};;
const getKey = () => {
  try{
    const scripts = document.getElementById('dosi_viewer').src || "";
    const queryString = scripts.replace(/^[^\?]+\??/,'');
    const splitString = queryString.split('=');

    if(splitString.length > 0){
      const key = splitString[1].replace(' ', '');
      return key;
    }

    return '';
  }catch(e){
    return '';
  }
};;
const getLocalStorage = (cname) => {
  if (typeof Storage !== 'undefined') {
    if (!localStorage.getItem(cname)) {
      return '';
    } else {
      return localStorage.getItem(cname);
    }
  }

  return '';
};;
function loadCDNFile(filename, filetype) {
  return new Promise((resolve) => {
    if (filetype == 'js') {
      var node = document.createElement('script');
      node.setAttribute('type', 'text/javascript');
      node.setAttribute('src', filename);
    } else if (filetype == 'css') {
      var node = document.createElement('link');
      node.setAttribute('rel', 'stylesheet');
      node.setAttribute('type', 'text/css');
      node.setAttribute('href', filename);
    }
  
    node.onload = function() {
      return resolve();
    };
  
    if (typeof node != 'undefined') {
      document.getElementsByTagName('head')[0].appendChild(node)
    }
  });
}

/**
 * 
 * @param {[{filename: string, filetype: string}]} files 
 */
async function loadMultiFiles(files) {
  return Promise.all(files.map(async file => {
    if (file !== null) {
      await loadCDNFile(file.filename, file.filetype);
    } else {
      return Promise.resolve();
    }
  }));
};
const log = async () => {
  try {
    newHref = window.location.href;
    dosiInfo = getLocalStorage(CONFIG.localStorageDosi);

    if(oldHref != newHref){
      oldHref = newHref;

      //check page reload
      if(window.performance)
      {
        if(performance.navigation.type == performance.navigation.TYPE_RELOAD)
        {
          isClick = false;
        }
      }
      
      if (window.location.href == oldUrl) {
        return;
      }
      // set referrer
      let referrer = oldUrl;

      // assign current url to oldUrl
      oldUrl = window.location.href;
      const userAgent = window.navigator.userAgent;
      const href = newHref;

      browserResolution.width = window.outerWidth;
      browserResolution.height = window.outerHeight;
      let isNewUser = false;

      if (typeof Storage !== 'undefined') {
        if (!localStorage.getItem('uuid')) {
          localStorage.setItem('uuid', uuid);
          isNewUser = true;
        } else {
          uuid = localStorage.getItem('uuid');
        }
      }else{
        isNewUser = true;
      }

      const websiteCode = getKey()
      let info = {
        websiteCode,
        ip,
        uuid,
        href,
        referrer,
        userAgent,
        isPrivateBrowsing,
        browserResolution,
        screenResolution,
        isClick,
        isNewUser,
        createdAt: new Date().getTime()
      };

      if(dosiInfo != ''){
        info['dosiInfo'] = dosiInfo;
      }

      if(websiteCode != '')
      {
        let json = JSON.stringify(info);
        const res = await fetch(APIs.log, {
          method: 'post',
          credentials: 'include',
          headers: {
            'Content-type': 'application/json'
          },
          body: json
        });
        const data = await res.json();
        logId = data.data.logId;
      }else{
        return;
      }

      return;
    }

    return;
  } catch (e) {
    return;
  }
};;
const onUnload = async () => {
  if (!logId) {
    return;
  }

  let timeOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
  oldTimeOnPage = timeOnPage > newTimeOnPage ? newTimeOnPage : oldTimeOnPage;
  newTimeOnPage = timeOnPage > newTimeOnPage ? timeOnPage : newTimeOnPage;

  if(newTimeOnPage > oldTimeOnPage)
  {
    try {
      oldTimeOnPage = newTimeOnPage;
      const url = APIs.timeUnload.replace(':id', logId);
      const body = {
        timeUnload: new Date().getTime(),
        timeOnPage: newTimeOnPage
      };
  
      $.ajax({
        type: 'PUT',
        async: false,
        url: url,
        data: body
      });
    } catch (e) {
      return;
    }
  }
};;
async function chrome76Detection() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage: e, quota: n } = await navigator.storage.estimate();
    return n < 12e7;
  }
  return !1;
}

function isNewChrome() {
  var e = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
  if (null == e || 5 != e.length) return;
  return e.map(e => parseInt(e, 10))[1] >= 76;
}

var PrivateWindow = new Promise(function (e, n) {
  try {
    if (navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && -1 == navigator.userAgent.indexOf('CriOS') && -1 == navigator.userAgent.indexOf('FxiOS')) {
      if (window.safariIncognito) !0; else try {
        window.openDatabase(null, null, null, null), window.localStorage.setItem('test', 1), e(!1);
      } catch (n) {
        !0, e(!0);
      }
    } else if (navigator.userAgent.includes('Firefox')) {
      var t = indexedDB.open('test');
      t.onerror = function () {e(!0);}, t.onsuccess = function () {e(!1);};
    } else if (navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Trident') || navigator.userAgent.includes('msie')) window.indexedDB || !window.PointerEvent && !window.MSPointerEvent || e(!0), e(!1); else {
      isNewChrome() && e(chrome76Detection());
      const n = window.RequestFileSystem || window.webkitRequestFileSystem;
      n ? n(window.TEMPORARY, 100, function (n) {e(!1);}, function (n) {e(!0);}) : e(null);
    }
  } catch (n) {
    return;
  }
});

function isPrivateWindow(e) {
  PrivateWindow.then(function(n) {
    e(n);
  });
}

const checkPrivate = async () => {
  await isPrivateWindow(is_private => {
    isPrivateBrowsing = is_private ? true : false;
  });
};;
function getScrollPercentage() {
  $(document).ready(function() {
    $(window).scroll(function(e) {
      let scrollTop = $(window).scrollTop();
      let docHeight = $(document).height();
      let winHeight = $(window).height();
      let scrollPercent = scrollTop / (docHeight - winHeight);
      let scrollPercentRounded = Math.round(scrollPercent * 100);
      oldScroll = scrollPercentRounded > newScroll ? newScroll : oldScroll;
      newScroll = scrollPercentRounded > newScroll ? scrollPercentRounded : newScroll;
    });
  });
}
;
const updateUser = async () => {
  try{
    if (!logId) {
      return;
    }

    let url = APIs.updateUserInfo.replace(':id', logId);
    dosiInfo = getLocalStorage(CONFIG.localStorageDosi);

    if(dosiInfo != ''){
      const body = {
        userInfo: dosiInfo
      };
      
      $.ajax({
        type: 'POST',
        async: false,
        url: url,
        data: body
      });
    }
  } catch (e) {
    return;
  }
};;
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
})();