/*
Roadmap
- Play and pause audio track
- Adjust volume
- [COMPLETE] Drag and drop load
- Slow down and speed up
- Audio visualizer
- [COMPLETE] Play multiple tracks at once
- Equalizer
- Save tracks after completing
*/

/*Audio Variables*/
var AudioContext        = window.AudioContext || window.webkitAudioContext
var audioContext        = new AudioContext()
var tracks              = []
var playing             = false

/*Canvas Variables*/
var audioManager        = document.getElementById('droparea')
var audioData           = document.getElementById('audio-data')
var trackData           = document.getElementById('track-data')
var timescale           = document.getElementById('timescale')
var overlay             = document.getElementById('overlay')
var dpr                 = window.devicePixelRatio
var colors              = ['#ff9645','#66ccff','#6bffa1','#bd6ffc']
var colorsLen           = 3
var defColor            = 0

/*Timescale Variable*/
var timescaleCtx        = timescale.getContext('2d')
var overlayCtx          = overlay.getContext('2d')
var pixelPerSec         = 3
var smGridClr           = '#292929'
var mnGridClr           = '#3d3d3d'
var progressClr         = '#5c0108'
var targetClr           = '#ababab'
var timerInterval
var startTime
var curTime

/*Playback Variables*/
var playBtn             = document.getElementById('play-btn')

/*Add Event Listeners*/
audioManager.addEventListener('drop',dropHandler,false)
audioManager.addEventListener('dragover',dragOverHandler,false)
overlay.addEventListener('mousemove',mouseMoveHandler,false)
overlay.addEventListener('mouseleave',mouseLeaveHandler,false)
overlay.addEventListener('click',clickHandler,false)
window.addEventListener('resize',resizeHandler,false)
playBtn.addEventListener('click',playHandler,false)



/*File Drop Handlers*/
function dropHandler(e){
    e.preventDefault()
    var data = e.dataTransfer.files
    var file = data[0]
    if (file.type == 'audio/mpeg'){
        if (defColor > colorsLen){
            defColor = 0
        }
        tracks.push(new Track(file,audioContext,trackData,audioData,colors[defColor]))
        defColor ++
    }
}
function dragOverHandler(e){
    e.preventDefault()
}

/*Audio Data Handlers*/
function mouseMoveHandler(e){
    let rect = e.target.getBoundingClientRect()
    drawTargetLine(e.clientX-rect.left)
}
function mouseLeaveHandler(e){
    if (!playing){
        overlayCtx.clearRect(0,0,overlay.clientWidth,overlay.clientHeight)
    }
}
function clickHandler(e){
    let rect = e.target.getBoundingClientRect()
}
function resizeHandler(e){
    calibrateCanvas(timescale,timescaleCtx)
    calibrateCanvas(overlay,overlayCtx)
    drawGrid()
    for (let track of tracks){
        calibrateCanvas(track.graph,track.ctx)
        track.ctx.translate(0,40)
        track.drawGraph()
    }
}

/*Playback Handlers*/
function playHandler(e){
    if (playing){
        for (let track of tracks){
            track.pauseTrack()
            clearInterval(timerInterval)
        }
    }
    else {
        playing = true
        for (let track of tracks){
            startTimer()
            track.playTrack()
        }
    }
}



/*Timescale Functions*/
function startTimer(){
    startTime = Date.now()
    curTime = 0
    timerInterval = setInterval(updateTimer,100)
}
function updateTimer(){
    curTime = Date.now() - startTime
    drawProgressLine(curTime/1000)
}
function drawGrid(){
    let length = timescale.clientWidth/(pixelPerSec*5)
    for (let i = 0; i<= length;i++){
        if (i%6 == 0){
            drawLine(timescaleCtx,1,timescale.clientHeight,mnGridClr,i*pixelPerSec*5)
        }
        else {
            drawLine(timescaleCtx,0.5,timescale.clientHeight,smGridClr,i*pixelPerSec*5)
        }
    }
}
function drawProgressLine(s){
    overlayCtx.clearRect(0,0,overlay.clientWidth,overlay.clientHeight)
    drawLine(overlayCtx,1,overlay.clientHeight,progressClr,s*pixelPerSec)
}
function drawTargetLine(x){
    overlayCtx.clearRect(0,0,overlay.clientWidth,overlay.clientHeight)
    drawLine(overlayCtx,1,overlay.clientHeight,targetClr,x)
}

/*Canvas Functions*/
function calibrateCanvas(canvas,ctx){
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr,dpr)
}
function drawLine(ctx,width,length,color,x){
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.moveTo(x,0)
    ctx.lineTo(x,length)
    ctx.stroke()
}

calibrateCanvas(timescale,timescaleCtx)
calibrateCanvas(overlay,overlayCtx)
drawGrid()