document.write('<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:200px;">The purpose of this page is to access your camera.</h1>');

var port = chrome.runtime.connect();

navigator.mediaDevices.getUserMedia({
    video: true
}).then(function(stream) {
    var tracksLength = stream.getTracks().length;

    stream.getTracks().forEach(function(track) {
        track.stop();
    });
    window.close();
    /*if(tracksLength <= 1) {
        throw new Error('Expected two tracks but received: ' + tracksLength);
    }*/
}).catch(function(e) {
    
});
