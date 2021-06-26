
////////////////////////// A few helper functions ///////////////////////////////////////////   
  
function resizeCanvasAndResults(dimensions, canvas, results) {
  const { width, height } = dimensions instanceof HTMLVideoElement
    ? faceapi.getMediaDimensions(dimensions)
    : dimensions
  canvas.width = width
  canvas.height = height

  return results.map(res => res.forSize(width, height))
}

  
function drawDetections(dimensions, canvas, detections) {
  const resizedDetections = resizeCanvasAndResults(dimensions, canvas, detections)
  faceapi.drawDetection(canvas, resizedDetections)
}

  
function drawLandmarks(dimensions, canvas, results, withBoxes = true) {
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results)
  if (withBoxes) {
      faceapi.drawDetection(canvas, resizedResults.map(det => det.detection))
  }
  const faceLandmarks = resizedResults.map(det => det.landmarks)
  const drawLandmarksOptions = { lineWidth: 2, drawLines: false, color: 'transparent' }
  faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions)
}    
    

  
////////////////////////// The 2 Main functions ///////////////////////////////////////////  
  
async function onPlay() {
   const videoEl = document.getElementById('video')
   const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 128, scoreThreshold : 0.3 }) 

   
   result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks(true)
   if (result) {
       drawLandmarks(videoEl, document.getElementById('canvas'), [result], true)
     
      
        
   }

    setTimeout(() => onPlay())
}

async function run() {
  await faceapi.loadTinyFaceDetectorModel('https://www.rocksetta.com/tensorflowjs/saved-models/face-api-js/')
   await faceapi.loadFaceLandmarkTinyModel('https://www.rocksetta.com/tensorflowjs/saved-models/face-api-js/')
    myPopupPage.load();
}

 run();