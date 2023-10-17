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
        this.multiplier         = 60
        this.graphData          = []

    }
    createAudioGraph(){
        this.GRAPH_CANVAS.setAttribute('class','track-graph')
        this.GRAPH_DIV.setAttribute('class','track')
        let width = 'width:'+this.duration*PIXEL_PER_SEC+'px'
        console.log(width)
        this.GRAPH_DIV.setAttribute('style',width)
        this.GRAPH_DIV.appendChild(this.GRAPH_CANVAS)
        calibrateCanvas(this.GRAPH_CANVAS,this.GRAPH_CTX)
        return this.GRAPH_DIV
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
            this.sourceNode.start(Math.abs(diff))
        }
    }
    stopSourceNode(){
        this.sourceNode.stop()
    }
    async createAudioBuffer(file){
        let arrayBuffer     = await file.arrayBuffer()
        this.audioBuffer    = await AUDIO_CTX.decodeAudioData(arrayBuffer)
    }
    calibrateGraph(){
        calibrateCanvas(this.GRAPH_CANVAS,this.GRAPH_CTX)
        this.GRAPH_CTX.translate(0,40)
    }

    /*Updates the graph data and draws graph*/
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

    /*Draws graph from graph data*/
    drawGraph(color){
        this.GRAPH_CTX.globalAlpha = 0.2;
        this.GRAPH_CTX.fillStyle = color;
        this.GRAPH_CTX.fillRect(0, -40, this.duration*PIXEL_PER_SEC, 80);
        this.GRAPH_CTX.globalAlpha = 1;
        for (let i=0; i<=this.duration; i++){
            this.drawGraphBar(i*PIXEL_PER_SEC,this.graphData[i]*this.multiplier,color)
        }
    }
    drawGraphBar(x,y,color){
        this.GRAPH_CTX.beginPath()
        this.GRAPH_CTX.lineWidth = 2
        this.GRAPH_CTX.lineCap = "round"
        this.GRAPH_CTX.strokeStyle = color
        this.GRAPH_CTX.moveTo(x,-y)
        this.GRAPH_CTX.lineTo(x,y)
        this.GRAPH_CTX.stroke()
    }
}
