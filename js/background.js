var version = chrome.runtime.getManifest().version;
var uiSettings = {  
  'is_expired' : false,
  'username' : "",
  'key' : "",
  'activate_date' : "",
};
var myApp = {
  search_change : false,
  onExtMessage: function(message, sender, sendResponse){
    myApp.message = message;
    switch (message.command) {
      case "saveUISettings":
      uiSettings = message.data;
      myApp.saveUISettings(message.data, sender, sendResponse);
      break;
      case "openSettingPage":
      myApp.openSettingPage(message.data, sender, sendResponse);
      break;
      case "uploadUserImage":
      myApp.uploadUserImage(message.data, sender, sendResponse);
      break;
      case "console_logs_myApp":
      console_logs_myApp(message.title,message.msg);
      break;
      case "getSettings":
      if(message.callback=="yes") {
        sendResponse({
          "uiSettings" : uiSettings
        });
      } else {
        sendMessage(sender, {
          "command": "rec_getSettings",
          "data" : {
            "uiSettings" : uiSettings
          }
        });
      }
      break;
    }
    return true;
  },
  load:function(){
    myApp.initStorage();
  },
  initStorage: function(_sender){
    var storedVersion = localStorage["version"];
    if(storedVersion != version){
      localStorage["version"]      = version;
      localStorage['uiSettings']   = JSON.stringify(uiSettings);
    }
    uiSettings  = JSON.parse(localStorage["uiSettings"]);
    
  },
  saveUISettings : function(data, _sender, sendResponse){
    localStorage["uiSettings"] = JSON.stringify(uiSettings);
    if(typeof(sendResponse)=="function") {
      sendResponse({uiSettings:uiSettings});
    }
  },
    uploadUserImage:function(postData){
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://demo.mews.li/api/commander/v1/customers/addFile",
      "method": "POST",
      "headers": {
        "cache-control": "no-cache",
        "postman-token": "0cdcbb32-beb8-86ee-12fa-a1a6be7d2a16"
      },
      "data": "{\"AccountId\":null,\"ProfileId\":\""+postData.ProfileId+"\",\"ScopeId\":\""+postData.ScopeId+"\",\"AccessToken\":\""+postData.AccessToken+"\",\"Application\":\"\",\"CustomerId\":\""+postData.CustomerId+"\",\"Data\":\""+postData.data+"\",\"Name\":\""+postData.Name+"\",\"Type\":\"image/png\",\"Client\":\"Mews Web Commander 5.885.1\"}"
    }

    $.ajax(settings).done(function (response) {
      $('.loading').hide();
      console.log(response);
      $('.camera').hide();
      $('#startbutton').hide();
      $('#sucees-msg').show();
      setTimeout(function(){
        var msg = 'reload-frame';
        sendMessage1('' + msg);
      },4000)
    })
    .fail(function (response) {
      $('.loading').hide();
      console.log(response);
      $('.camera').hide();
      $('#startbutton').hide();
      $('#warning-msg').show();
      setTimeout(function(){
        var msg = 'reload-frame';
        sendMessage1('' + msg);
      },4000)
    });
  },
  openSettingPage:function(){
      // open extension new tab if check is open or not
      var pageURL = chrome.runtime.getURL("html/settings.html");
      chrome.tabs.query({url: pageURL}, function(query_tab) {
        if (typeof(query_tab) != "undefined" && query_tab.length > 0) {
          chrome.windows.update(query_tab[0].windowId, {focused : true}, function(){ });
          var current_tab_id = query_tab[0].id;
          chrome.tabs.update(parseInt(current_tab_id), {active : true}, function(){ });
        } else {
          chrome.tabs.create({url : pageURL}, function(){ });
        }

      });
    },

  };
 /* chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (tab) {
      if (tab.url!=undefined) {
        var current_url = tab.url;
      } 
    });
  });*/

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.status == "complete") {
      var current_url=tab.url
    }

  });


  chrome.runtime.onMessage.addListener(myApp.onExtMessage);
  myApp.load();

  function sendMessage(tabId, msg){
    if(tabId) chrome.tabs.sendMessage(tabId, msg);
    else chrome.runtime.sendMessage(sender.id, msg);
  }

  var console_logs_myApp = function(title,msg){
    console.log("%c "+title, "font-weight: bold");
    if(typeof(msg)=="object") {
      console.log("%c "+JSON.stringify(msg), 'color:#ce3e3e');
    } else {
      console.log("%c "+msg, 'color:#ce3e3e');
    }
  };

