class Track{
    constructor(){
        /*Element Creation*/
        this.GRAPH_DIV          = document.createElement('div')
        this.GRAPH_CANVAS       = document.createElement('canvas')
        this.GRAPH_CTX          = this.GRAPH_CANVAS.getContext('2d')

        /*Track Variables*/
        this.name               = 0
        this.duration           = 0
        this.offset             = 0
        this.shorten            = 0
        this.trackIndex         = 0
        this.graphData          = []
        this.sourceNode         = ''
        this.audioBuffer        = ''

        /*Editing Variables*/
        this.startPos           = 0
        this.moving             = false
    }
    async createAudioBuffer(file){
        let arrayBuffer     = await file.arrayBuffer()
        this.audioBuffer    = await AUDIO_CTX.decodeAudioData(arrayBuffer)
    }
    mouseDownHandler(e){
        e.preventDefault()
        if (e.button === 1){
            this.moving = true
            this.startPos = e.clientX
            pause()
        }
    }
    mouseUpHandler(e){
        e.preventDefault()
        if (e.button === 1){
            this.offset += (e.clientX - this.startPos)/PIXEL_PER_SEC
            this.GRAPH_DIV.style.left = this.offset*PIXEL_PER_SEC + 'px'
            this.moving = false
        }
    }
    moveTrackHandler(e){
        e.preventDefault()
        if (this.moving){
            this.GRAPH_DIV.style.left = this.offset*PIXEL_PER_SEC + e.clientX - this.startPos + 'px'
        }

    }
    createEventListeners(){
        this.GRAPH_DIV.addEventListener('mousedown',this.mouseDownHandler.bind(this),false)
        this.GRAPH_DIV.addEventListener('mouseup',this.mouseUpHandler.bind(this),false)
        this.GRAPH_DIV.addEventListener('mousemove',this.moveTrackHandler.bind(this),false)
        this.GRAPH_DIV.addEventListener('mouseleave',this.mouseUpHandler.bind(this),false)
    }

    createSourceNode(gainNode){
        this.sourceNode = AUDIO_CTX.createBufferSource()
        this.sourceNode.buffer = this.audioBuffer
        this.sourceNode.connect(gainNode)
    }
    startSourceNode(startTime){
        let diff = startTime - this.offset
        if (diff > 0){
            this.sourceNode.start(0,diff)
        }
        else {
            this.sourceNode.start(AUDIO_CTX.currentTime+Math.abs(diff))
        }
    }
    stopSourceNode(){
        this.sourceNode.stop()
    }



    createAudioGraph(){
        let width = 'width:'+this.duration*PIXEL_PER_SEC+'px'
        this.GRAPH_CANVAS.setAttribute('class','track-graph')
        this.GRAPH_DIV.setAttribute('class','track')
        this.GRAPH_DIV.setAttribute('style',width)
        this.GRAPH_DIV.appendChild(this.GRAPH_CANVAS)
    }
    calibrateGraph(){
        calibrateCanvas(this.GRAPH_CANVAS,this.GRAPH_CTX)
        this.GRAPH_CTX.translate(0,40)
    }
    createGraphData(){
        let sampleRate          = this.audioBuffer.sampleRate
        let length              = this.audioBuffer.length
        let data                = this.audioBuffer.getChannelData(0)
        this.duration           = length/sampleRate
        this.graphData          = []
        for (let i=0; i<=this.duration; i++){
            let sum = 0
            let time = i*sampleRate
            for (let j=0; j<=sampleRate; j++){
                if (time+j >= length){
                    break
                }
                sum += Math.abs(data[time+j])
            }
            this.graphData.push(sum/sampleRate)
        }
        
    }
    drawGraph(color){
        this.GRAPH_CTX.globalAlpha = 0.2;
        this.GRAPH_CTX.fillStyle = color;
        this.GRAPH_CTX.fillRect(0, -40, this.duration*PIXEL_PER_SEC, 80);
        this.GRAPH_CTX.globalAlpha = 1;
        for (let i=0; i<=this.duration; i++){
            let x = i*PIXEL_PER_SEC
            let y = this.graphData[i]*GRAPH_SIZE
            this.GRAPH_CTX.beginPath()
            this.GRAPH_CTX.lineWidth = 2
            this.GRAPH_CTX.lineCap = "round"
            this.GRAPH_CTX.strokeStyle = color
            this.GRAPH_CTX.moveTo(x,-y)
            this.GRAPH_CTX.lineTo(x,y)
            this.GRAPH_CTX.stroke()
        }
    }
}
