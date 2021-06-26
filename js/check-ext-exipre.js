var callback=[];
var checkExipreObj = {
  uiSettings : {},
  isCheckActivate: function(callback){
    var user_validate = false;
    sendMessage({"command": "getSettings"},function(response){
      if (typeof(response) == "undefined" && typeof(uiSettings) != "undefined" ) {
        checkExipreObj.uiSettings  = uiSettings;
      } else {
        checkExipreObj.uiSettings  = response.uiSettings;
      }
      if (checkExipreObj.uiSettings.activate_date != "") {
        var activate_date = new Date(parseInt(atob(checkExipreObj.uiSettings.activate_date)));
        if (activate_date != "Invalid Date") {
          var days_diff = checkExipreObj.daysBetween(new Date(activate_date).getTime(),new Date().getTime());
          days_diff = parseInt(days_diff);          
          if (days_diff <= 365) {
            user_validate = true;
          } else {
            user_validate = false;
          }        
        } else {
          user_validate = false;
        }
      } else {
        user_validate = false;
      }
      callback(user_validate);
    });
  },
  treatAsUTC : function(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  },
  daysBetween : function(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (checkExipreObj.treatAsUTC(endDate) - checkExipreObj.treatAsUTC(startDate)) / millisecondsPerDay;
  }
};
