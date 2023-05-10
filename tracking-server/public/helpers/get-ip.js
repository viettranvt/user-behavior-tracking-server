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
};