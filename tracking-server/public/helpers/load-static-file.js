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
}