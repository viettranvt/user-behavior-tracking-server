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
};