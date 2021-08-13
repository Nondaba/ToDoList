exports.getDate = function(){
   
    const options = {
        day:'numeric',
        weekday: 'long',
        month:'long',
        year:'numeric'     
    };
    const today = new Date().toLocaleString('en-US',options);
    return today;
}