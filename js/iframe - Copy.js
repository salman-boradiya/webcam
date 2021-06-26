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
  ss:function(){
        var width = 340; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream

        var streaming = false;

        var video = null;
        var ctx = null;
        var photo = null;
        var startbutton = null;
        
        var initialized = false;
        function button_callback() {
      /*
        (0) check whether we're already running face detection
        */
        if(initialized)
        return; // if yes, then do not initialize everything again
      /*
        (1) initialize the pico.js face detector
        */


      var update_memory = pico.instantiate_detection_memory(5); // we will use the detecions of the last 5 frames
      var facefinder_classify_region = function(r, c, s, pixels, ldim) {return -1.0;};
      var cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
      fetch(cascadeurl).then(function(response) {
        response.arrayBuffer().then(function(buffer) {
          var bytes = new Int8Array(buffer);
          facefinder_classify_region = pico.unpack_cascade(bytes);
          console.log('* facefinder loaded');
        })
      })
      /*
        (2) initialize the lploc.js library with a pupil localizer
        */
        var do_puploc = function(r, c, s, nperturbs, pixels, nrows, ncols, ldim) {return [-1.0, -1.0];};
        var puplocurl = 'https://drone.nenadmarkus.com/data/blog-stuff/puploc.bin'
        fetch(puplocurl).then(function(response) {
          response.arrayBuffer().then(function(buffer) {
            var bytes = new Int8Array(buffer);
            do_puploc = lploc.unpack_localizer(bytes);
            console.log('* puploc loaded');
          })
        })
      /*
        (3) get the drawing context on the canvas and define a function to transform an RGBA image to grayscale
        */
        ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        startbutton.addEventListener('click', function(ev) {
          takepicture();
          ev.preventDefault();
        }, false);

        function takepicture() {
         
          if (width && height) {

            var data = document.getElementsByTagName('canvas')[0].toDataURL("image/png");
            photo.setAttribute('src', data);
            _stream.getTracks().forEach(function(track) {
              track.stop();
            });
          } else {
            clearphoto();
          }
        
        }

        function rgba_to_grayscale(rgba, nrows, ncols) {
          var gray = new Uint8Array(nrows*ncols);
          for(var r=0; r<nrows; ++r)
            for(var c=0; c<ncols; ++c)
            // gray = 0.2*red + 0.7*green + 0.1*blue
          gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
          return gray;
        }
      /*
        (4) this function is called each time a video frame becomes available
        */
        var processfn = function(video, dt) {
        // render the video frame to the canvas element and extract RGBA pixel data
        width=340;
        height = video.videoHeight / (video.videoWidth / width);
        
        if (isNaN(height)) {
          height = width / (4 / 3);
        }
        ctx.drawImage(video, 0, 0, width, height);

          //ctx.drawImage(video, width, height);

          var rgba = ctx.getImageData(0, 0, 340, 280).data;
        // prepare input to `run_cascade`
        image = {
          "pixels": rgba_to_grayscale(rgba, 280, 340),
          "nrows": 280,
          "ncols": 340,
          "ldim": 340
        }
        params = {
          "shiftfactor": 0.1, // move the detection window by 10% of its size
          "minsize": 100,     // minimum size of a face
          "maxsize": 1000,    // maximum size of a face
          "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
        }
        // run the cascade over the frame and cluster the obtained detections
        // dets is an array that contains (r, c, s, q) quadruplets
        // (representing row, column, scale and detection score)
        dets = pico.run_cascade(image, facefinder_classify_region, params);
        dets = update_memory(dets);
        dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
        // draw detections
        for(i=0; i<dets.length; ++i)
          // check the detection score
          // if it's above the threshold, draw it
          // (the constant 50.0 is empirical: other cascades might require a different one)
          if(dets[i][3]>50.0)
          {
            var r, c, s;
            //
            ctx.beginPath();
            ctx.arc(dets[i][1], dets[i][0], dets[i][2]/2, 0, 2*Math.PI, false);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'red';
            ctx.stroke();
            //
            // find the eye pupils for each detected face
            // starting regions for localization are initialized based on the face bounding box
            // (parameters are set empirically)
            // first eye
            r = dets[i][0] - 0.075*dets[i][2];
            c = dets[i][1] - 0.175*dets[i][2];
            s = 0.35*dets[i][2];
            [r, c] = do_puploc(r, c, s, 63, image)
            if(r>=0 && c>=0)
            {
              ctx.beginPath();
              ctx.arc(c, r, 1, 0, 2*Math.PI, false);
              ctx.lineWidth = 3;
              ctx.strokeStyle = 'red';
              ctx.stroke();
            }
            // second eye
            r = dets[i][0] - 0.075*dets[i][2];
            c = dets[i][1] + 0.175*dets[i][2];
            s = 0.35*dets[i][2];
            [r, c] = do_puploc(r, c, s, 63, image)
            if(r>=0 && c>=0)
            {
              ctx.beginPath();
              ctx.arc(c, r, 1, 0, 2*Math.PI, false);
              ctx.lineWidth = 3;
              ctx.strokeStyle = 'red';
              ctx.stroke();
            }
          }
        }

      /*
        (5) instantiate camera handling (see https://github.com/cbrandolino/camvas)
        */
        var mycamvas = new camvas(ctx, processfn);
      /*
        (6) it seems that everything went well
        */
        initialized = true;
      }
      button_callback();
    },
    hasPermission:function(){
        var width = 260; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream

        var streaming = false;

        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
        
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
            myPopupPage.ss('camera');
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

