var callback=[];
var mySettingPage = {
  uiSettings : {},
  load: function(){
    // Init bootstrap material
    $.material.init();
    mySettingPage.addEvents();
    mySettingPage.initSettings();
  },
  initSettings: function() {
    sendMessage({"command": "getSettings"},function(response){
      mySettingPage.uiSettings  = response.uiSettings;
      $('#user_email').val(mySettingPage.uiSettings.username);
      $('#user_key').val(mySettingPage.uiSettings.key);
      checkExipreObj.isCheckActivate(function(checkActivate){
        if ( checkActivate == true) {
          $('#user_email').attr('disabled',true);
          $('#user_key').attr('disabled',true);
          $('#saveBtn').attr('disabled',true);
        }
      });
    });
  },
  addEvents: function(){ 
    $("#ext_activate_form").unbind('submit');
    $("#ext_activate_form").submit(function(e){
      e.preventDefault();
      $('#msgInfoSection').html("");
      var user_email = $('#user_email').val();
      if(user_email == "") {
       $('#user_email').parent().addClass('has-error');
       $('#user_email').focus();
       return false;
     } else if (mySettingPage.validateEmail(user_email) == false) {
       $('#user_email').parent().addClass('has-error');
       $('#user_email').focus();
       return false;
     } else {
       $('#user_email').parent().removeClass('has-error');
     }
     var user_key = $('#user_key').val();
     if(user_key == "") {
       $('#user_key').parent().addClass('has-error');
       $('#user_key').focus();
       return false;
     } else {
       $('#user_email').parent().removeClass('has-error');
     }
     checkExipreObj.isCheckActivate(function(checkActivate){
      if ( checkActivate == false) {
        var today_date = new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear();
        var expected_key = SHA1(user_email.trim() + today_date);
        if (user_key == expected_key) {
         mySettingPage.uiSettings.key = user_key;
         mySettingPage.uiSettings.username = user_email;
         mySettingPage.uiSettings.activate_date = btoa(new Date().getTime());       
         sendMessage({"command": "saveUISettings",data:mySettingPage.uiSettings},function(response){
           $('#saveBtn').val('SAVED!');           
           $('#msgInfoSection').html(
             '<div class="alert alert-success alert-dismissible" role="alert">'+
             '<strong>Great!</strong> Your settings are saved, and extension is now functional.'+
             '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
             '<span aria-hidden="true">&times;</span>'+
             '</button>'+
             '</div>');
           setTimeout(function(){
            $('#msgInfoSection').html("");
          },5000);
           setTimeout(function(){
            $('#saveBtn').val('SAVE');
          },1000);
           mySettingPage.initSettings();
         });
       } else {
         $('#msgInfoSection').show();
         $('#msgInfoSection').html( 
           '<div class="alert alert-danger alert-dismissible" role="alert">'+
           '<strong>Error!</strong> Your entered key is invalid.'+
           '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
           '<span aria-hidden="true">&times;</span>'+
           '</button>'+
           '</div>');
       }
     }
   });
   });
  },  
  validateEmail : function(email){
    var emailReg = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    var valid = emailReg.test(email);

    if(!valid) {
      return false;
    } else {
      return true;
    }
  }
};

function sendMessage(msg, callbackfn) {
  if(callbackfn!=null) {
    callback.push(callbackfn);
    msg.callback = "yes";
  }
  chrome.runtime.sendMessage(msg,callbackfn);
}

function handleMessage(message, sender) {
  switch (message.command) {
    case "rec_getSettings":
    mySettingPage.uiSettings  = message.data.uiSettings;
    break;
  }  
  if(typeof(message.data)!="undefined") {
    if(typeof(message.callback)!="undefined" && message.callback=="yes") {
      var fun = callback.pop();
    }
  }
}

window.addEventListener("load",function() {
  chrome.runtime.onMessage.addListener(handleMessage);
  mySettingPage.load();
});
