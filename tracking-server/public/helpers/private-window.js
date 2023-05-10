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
};