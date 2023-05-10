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
};