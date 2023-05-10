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
};