var WDOptions = {};
var callback=[];

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
    //myPopupPage.uiSettings  = message.data.uiSettings;
    break;
  }  
}

window.addEventListener("load",function() {
  chrome.runtime.onMessage.addListener(handleMessage);
  myPopupPage.load();
});

var uiSettings;

var myPopupPage = {
  load: function(){
    myPopupPage.addEvents();
    myPopupPage.getCameraContentSettngs();
  } ,

  addEvents: function(){
    $('#submitbutton').off().on('click',function(e){
      $('.loading').show();
      var strToReplace = $('#photo').attr('src');
      var strImage = strToReplace.replace(/^data:image\/[a-z]+;base64,/, "");
      var name=makeid(11)+'.png';
      myPopupPage.getCookies("https://demo.mews.li/", "AccessToken", function(AccessToken) {
        if (AccessToken !="") {
          var postData={Name:name,data:strImage,AccessToken:AccessToken,ProfileId:'455a381e-888a-4b22-87f2-ad5100902cb5',ScopeId:'Enterprise_0618eabf-36f4-4ec0-83e4-ab0c007452ca',CustomerId:'61448173-76f7-4f64-b205-ace600241ae1'}
          myPopupPage.uploadUserImage(postData)
        }
      });
    })
  },  
  getAccesstoken:function(){
    myPopupPage.getCookies("https://demo.mews.li/", "AccessToken", function(AccessToken) {
      console.log(AccessToken)
    });
  },

  getCookies:function(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
      if(callback) {
        if (!!cookie) {
          callback(cookie.value);
        }else{
          callback('');
        }
      }
    });
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
        sendMessage('' + msg);
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
        sendMessage('' + msg);
      },4000)
    });
  },
  hasPermission:function(){
        var width = 260; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream

        var streaming = false;

        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
        var _stream= null;
        function startup() {
          video = document.getElementById('video');
          canvas = document.getElementById('canvas');
          photo = document.getElementById('photo');
          startbutton = document.getElementById('startbutton');

          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          })
          .then(function(stream) {
            _stream=stream;
            video.srcObject = stream;
            video.play();
          })
          .catch(function(err) {
            console.log("An error occurred: " + err);
          });

          video.addEventListener('canplay', function(ev) {

            if (!streaming) {
              height = video.videoHeight / (video.videoWidth / width);

              if (isNaN(height)) {
                height = width / (4 / 3);
              }

              video.setAttribute('width', width);
              video.setAttribute('height', height);
              canvas.setAttribute('width', width);
              canvas.setAttribute('height', height);
              streaming = true;

            }
          }, false);

          startbutton.addEventListener('click', function(ev) {
            takepicture();
            ev.preventDefault();
          }, false);

          clearphoto();
        }


        function clearphoto() {
          var context = canvas.getContext('2d');
          context.fillStyle = "#AAA";
          context.fillRect(0, 0, canvas.width, canvas.height);

          var data = canvas.toDataURL('image/png');
          photo.setAttribute('src', data);
        }

        function takepicture() {
          var context = canvas.getContext('2d');
          if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            _stream.getTracks().forEach(function(track) {
              track.stop();
            });
          } else {
            clearphoto();
          }
        }
        startup();
      },
      getPermissionCamera:function(){
        var popup_width = screen.width - parseInt(screen.width / 3);
        var popup_height = screen.height - parseInt(screen.height / 3);
        chrome.windows.create({
          url: 'camera-check.html',
          type: 'popup',
          width: popup_width,
          height: popup_height,
          top: parseInt((screen.height / 2) - (popup_height / 2)),
          left: parseInt((screen.width / 2) - (popup_width / 2)),
          focused: true
        });
         var msg = 'close-frame';
        sendMessage('' + msg);

      },
      getCameraContentSettngs:function(){
        chrome.contentSettings.camera && chrome.contentSettings.camera.get({
          'primaryUrl': window.location.href,
        },
        function(details) {
          if (details.setting=='ask') {
            myPopupPage.getPermissionCamera();
          }else{
            myPopupPage.hasPermission('camera');
          }
        });
      }

    };

    var sendMessage = function(msg) {
      window.parent.postMessage(msg, '*');
    };



    function makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
         charactersLength));
      }
      return result;
    }

