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
};