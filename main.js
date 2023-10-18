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

Style
- CAPITAL and _ for elements and context
- _CTX for contexts
- camelCase for values
- clr short for color
*/

/*Audio Variables*/
const AudioContext      = window.AudioContext || window.webkitAudioContext
const AUDIO_CTX         = new AudioContext()

/*Main Document Elements*/
const AUDIO_MANAGER_DIV = document.getElementById('droparea')
const TRACK_DATA_DIV    = document.getElementById('track-data')
const ROW_DATA_DIV      = document.getElementById('row-data')
const TIMESCALE_CANVAS  = document.getElementById('timescale')
const OVERLAY_CANVAS    = document.getElementById('overlay')

/*Add Event Listeners*/
AUDIO_MANAGER_DIV.addEventListener('drop',fileHandler,false)
AUDIO_MANAGER_DIV.addEventListener('dragover',dragOverHandler,false)
TRACK_DATA_DIV.addEventListener('mousemove',cursorMoveHandler,false)
TRACK_DATA_DIV.addEventListener('mouseleave',cursorLeaveHandler,false)
TRACK_DATA_DIV.addEventListener('click',cursorSetHandler,false)
window.addEventListener('resize',resizeHandler,false)
window.addEventListener('keydown',playHandler,false)

/*Global Constants*/
const PIXEL_PER_SEC     = 3
const GRAPH_SIZE        = 60



/*Timescale Variables*/
const TS = {
    TIMESCALE_CTX:      TIMESCALE_CANVAS.getContext('2d'),
    SM_GRID_COLOR:      '#292929',
    MD_GRID_COLOR:      '#3d3d3d',
    SM_GRID_FREQ:       5,
    MD_GRID_FREQ:       6,
    SM_GRID_W:          0.5,
    MD_GRID_W:          1,
}
TS.drawTimeScale = function(){
    let width           = TIMESCALE_CANVAS.clientWidth
    let height          = TIMESCALE_CANVAS.clientHeight
    let length          = width/(PIXEL_PER_SEC*this.SM_GRID_FREQ)

    for (let i = 0; i<= length; i++){
        let x = i*PIXEL_PER_SEC*this.SM_GRID_FREQ
        if (i%this.MD_GRID_FREQ == 0){
            drawLine(this.TIMESCALE_CTX,this.MD_GRID_W,height,this.MD_GRID_COLOR,x)
        }
        else {
            drawLine(this.TIMESCALE_CTX,this.SM_GRID_W,height,this.SM_GRID_COLOR,x)
        }
    }
}
TS.calibrate = function(seconds){
    calibrateCanvas(TIMESCALE_CANVAS,this.TIMESCALE_CTX)
    this.drawTimeScale()
}



/*Clock Variables*/
CK = {
    MILLI_SPAN:         document.getElementById('mil'),
    SECONDS_SPAN:       document.getElementById('sec'),
    MINUTES_SPAN:       document.getElementById('min'),
    OVERLAY_CTX:        OVERLAY_CANVAS.getContext('2d'),
    PLAYING:            false,
    CURRENT_TIME:       0,
    START_TIME:         0,
    REF_TIME:           0,
    TIMER_INTERVAL:     '',
    CURSOR_ON:          false,
    CURSOR_POS:         0,
    CURSOR_COLOR:       '#ababab',
    PROGRESS_COLOR:     '#a80202'
}
CK.drawGuideLines = function(){
    let width           = OVERLAY_CANVAS.clientWidth
    let height          = OVERLAY_CANVAS.clientHeight

    this.OVERLAY_CTX.clearRect(0,0,width,height)
    drawLine(this.OVERLAY_CTX,1,height,this.PROGRESS_COLOR,this.CURRENT_TIME*PIXEL_PER_SEC)

    if (this.CURSOR_ON){
        drawLine(this.OVERLAY_CTX,1,height,this.CURSOR_COLOR,this.CURSOR_POS)
    }
}
CK.startClock = function(){
    this.PLAYING        = true
    this.REF_TIME       = Date.now()
    this.CURRENT_TIME   = this.START_TIME
    this.TIMER_INTERVAL = setInterval(this.updateClock.bind(CK),10)
}
CK.updateClock = function(){
    this.CURRENT_TIME   = (Date.now() - this.REF_TIME)/1000 + this.START_TIME
    this.setTime(this.CURRENT_TIME)
    this.drawGuideLines()
}
CK.stopClock = function(){
    this.PLAYING        = false
    this.START_TIME     = this.CURRENT_TIME
    this.drawGuideLines()
    clearInterval(this.TIMER_INTERVAL)
}
CK.calibrate = function(){
    calibrateCanvas(OVERLAY_CANVAS,this.OVERLAY_CTX)
    this.drawGuideLines()
}
CK.setTime = function(time){
    let min = Math.floor(time/60)
    let sec = Math.floor(time-min*60)
    let mil = Math.floor((time%1)*1000)
    min = min.toString().padStart(2,'0')
    sec = sec.toString().padStart(2,'0')
    mil = mil.toString().padStart(3,'0')
    CK.MINUTES_SPAN.innerHTML = min
    CK.SECONDS_SPAN.innerHTML = sec
    CK.MILLI_SPAN.innerHTML = mil
}



/*Row Variables*/
const RD = {
    ROWS:               [],
    ROW_COLORS:         ['#ff9645','#66ccff','#6bffa1','#bd6ffc']
}
RD.startRows = function(startTime){
    for (let row of this.ROWS){
        row.startTracks(startTime)
    }
}
RD.stopRows = function(){
    for (let row of this.ROWS){
        row.stopTracks()
    }
}


/*File Drop Handlers*/
async function fileHandler(e){
    e.preventDefault()
    let file = e.dataTransfer.files[0]
    if (file.type == 'audio/mpeg'){
        let rowColor    = RD.ROW_COLORS[RD.ROWS.length%RD.ROW_COLORS.length]
        let newRow      = createRow(rowColor)
        let newTrack    = await createTrack(file)
        newRow.addTrack(newTrack)
        RD.ROWS.push(newRow)
    }
}
function dragOverHandler(e){
    e.preventDefault()
}


/*Cursor Handlers*/
function cursorMoveHandler(e){
    let rect            = OVERLAY_CANVAS.getBoundingClientRect()
    CK.CURSOR_ON        = true
    CK.CURSOR_POS       = e.clientX-rect.left
    CK.drawGuideLines()
}
function cursorLeaveHandler(e){
    CK.CURSOR_ON        = false
    CK.drawGuideLines()
}
function cursorSetHandler(e){
    if (e.button === 0){
        CK.CURRENT_TIME = CK.CURSOR_POS/PIXEL_PER_SEC
        CK.START_TIME   = CK.CURRENT_TIME
        CK.setTime(CK.START_TIME)
        CK.drawGuideLines()
        if (CK.PLAYING){
            playHandler()
            playHandler()
        }
    }
}


/*Playback Handlers*/
function playHandler(){
    if (!CK.PLAYING){
        CK.startClock()
        RD.startRows(CK.START_TIME)
    }
    else {
        CK.stopClock()
        RD.stopRows()
    }
}
function pause(){
    if (CK.PLAYING){
        CK.stopClock()
        RD.stopRows()
    }
}

/*Canvas Handlers*/
function resizeHandler(e){
    TS.calibrate()
    CK.calibrate()
}


/*Universal Functions*/
function calibrateCanvas(canvas,ctx){
    let dpr             = window.devicePixelRatio
    canvas.width        = canvas.clientWidth * dpr
    canvas.height       = canvas.clientHeight * dpr
    ctx.scale(dpr,dpr)
}
function drawLine(ctx,width,length,color,x){
    ctx.beginPath()
    ctx.lineWidth       = width
    ctx.strokeStyle     = color
    ctx.moveTo(x,0)
    ctx.lineTo(x,length)
    ctx.stroke()
}
async function createTrack(file){
    let newTrack = new Track()
    await newTrack.createAudioBuffer(file)
    newTrack.createGraphData()
    newTrack.createAudioGraph()
    return newTrack
}

function createRow(color){
    let newRow = new Row(color)
    ROW_DATA_DIV.appendChild(newRow.createRowControls())
    TRACK_DATA_DIV.appendChild(newRow.createRow())
    return newRow
}
function test(){
    console.log('WORKED')
}

TS.calibrate()
CK.calibrate()
