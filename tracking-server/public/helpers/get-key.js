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
};