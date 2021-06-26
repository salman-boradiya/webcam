var callback=[];
var myContentPage = {
  load:function(){
    waitForFileupload('.Spacing-sc-16qe6xr-0.bcjfLc', function() {
      var btn=`<button id="capture-photo" class="style__ButtonElement-jv24-0 jmeEui"><span>Take Photo</span></button>`;
      $('.Spacing-sc-16qe6xr-0.bcjfLc').find('[data-test-id="form-main-button"]').after(btn);
      myContentPage.addEvents();

    })
  },
  onExtMessage: function(message, sender, sendResponse){
    myContentPage.message = message;
    switch (message.command) {
      case "rec_LoadExtension":
      myContentPage.load();
      break;
    }
    return true;
  },
  openCameraIframe:function(){
    var iframe = $('<iframe frameborder="0"  allow="camera;microphone" marginwidth="0" marginheight="0" allowfullscreen></iframe>');
    var dialog = $("<div id='screen-cap-iframe'></div>").append(iframe).appendTo("body").dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      width: "auto",
      height: "auto",
      close: function () {
        iframe.attr("src", "");
      }
    });

    iframe.attr({
      width: 600,
      height: 500,
      src: chrome.runtime.getURL('html/popup.html')
    });
    dialog.dialog("option", "title", 'Take Photo').dialog("open");
  },
  openSettingPage:function(){
    sendMessage({"command": "openSettingPage"})
  
    },
    addEvents: function(message, sender, sendResponse){
      $('[ data-test-id="add_box"]').off().on('click',function(e){
        myContentPage.load()
      })
      $('#capture-photo').off().on('click',function(e){
        checkExipreObj.isCheckActivate(function(checkActivate){
          if ( checkActivate == true ) {
            myContentPage.openCameraIframe();
          } else {
            myContentPage.openSettingPage();
          }
        });

      });

    }

  };

  chrome.runtime.onMessage.addListener(myContentPage.onExtMessage);

  $(document).ready(function(){
    setTimeout(function(){
      myContentPage.load();
      myContentPage.addEvents();
    },1000);
  });


  var console_logs_myApp = function(title,msg){
    console.log("%c "+title, "font-weight: bold");
    if(typeof(msg) == "object") {
      console.log("%c "+JSON.stringify(msg), 'color:#ce3e3e');
    } else {
      console.log("%c "+msg, 'color:#ce3e3e');
    }
  };

  function sendMessage(msg, callbackfn) {
    if(callbackfn!=null) {
      callback.push(callbackfn);
      msg.callback = "yes";
    }
    chrome.runtime.sendMessage(msg,callbackfn);
  }

  var waitForFileupload = function(selector, callback) {
    if (jQuery(selector).length) {
      callback();
    } else {
      setTimeout(function() {
        waitForFileupload(selector, callback);
      }, 300);
    }
  };

  window.addEventListener("message", function(event) {
   if (event.data == 'close-frame') {

    $('#screen-cap-iframe').remove();


  }
  if (event.data == 'reload-frame') {

    window.location.reload();


  }
});