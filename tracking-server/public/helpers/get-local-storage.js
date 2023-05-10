const getLocalStorage = (cname) => {
  if (typeof Storage !== 'undefined') {
    if (!localStorage.getItem(cname)) {
      return '';
    } else {
      return localStorage.getItem(cname);
    }
  }

  return '';
};