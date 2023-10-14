class Track{
    constructor(file,audioContext,trackData,audioData,color){
        /*Track Info*/
        this.trackInfo      = document.createElement('div')
        this.trackName      = document.createElement('p')        

        /*Audio Visualizer*/
        this.container      = document.createElement('div')
        this.graph          = document.createElement('canvas')
        this.ctx            = this.graph.getContext('2d')
        this.color          = color
        this.multiplier     = 60
        this.audioBuffer    = ''
        this.sampleRate     = 0
        this.length         = 0
        this.duration       = 0
        this.graphData      = []

        /*Audio*/
        this.srcNode        = audioContext.createBufferSource()
        this.gainNode       = audioContext.createGain()

        /*Creating HTML Elements*/
        this.trackInfo.setAttribute('class','track-info')
        this.trackInfo.appendChild(this.trackName)
        this.trackName.textContent = file.name
        this.graph.setAttribute('class','track-graph')
        this.container.setAttribute('class','track')
        this.container.appendChild(this.graph)
        trackData.appendChild(this.trackInfo)
        audioData.appendChild(this.container)

        /*Set up*/
        this.createAudioBuffer(file,audioContext)
        calibrateCanvas(this.graph,this.ctx)
        this.ctx.translate(0,40)
    }

    /*Loads audioBuffer from given file and audioContext*/
    async createAudioBuffer(file,audioContext){
        let arrayBuffer     = await file.arrayBuffer()
        this.audioBuffer    = await audioContext.decodeAudioData(arrayBuffer)
        this.trackSrc       = this.audioBuffer
        this.sampleRate     = this.audioBuffer.sampleRate
        this.length         = this.audioBuffer.length
        this.updateGraphData()
        this.srcNode.buffer = this.audioBuffer
        this.srcNode.connect(this.gainNode)
        this.gainNode.connect(audioContext.destination)
    }

    /*Play audio*/
    playTrack(){
        this.srcNode.start()
    }

    /*Pause audio*/
    pauseTrack(){
        this.srcNode.stop()
    }

    /*Updates the graph data and draws graph*/
    updateGraphData(){
        let data = this.audioBuffer.getChannelData(0)
        this.duration = Math.floor(this.length/this.sampleRate)
        this.graphData = []
        for (let i=0; i<=this.duration; i++){
            let sum = 0
            let time = i*this.sampleRate
            for (let j=0; j<=this.sampleRate; j++){
                sum += Math.abs(data[time+j])
            }
            this.graphData.push(sum/this.sampleRate)
            this.drawLine(i*pixelPerSec,sum/this.sampleRate*this.multiplier)
        }        
    }

    /*Draws graph from graph data*/
    drawGraph(){
        for (let i=0; i<=this.duration; i++){
            this.drawLine(i*pixelPerSec,this.graphData[i]*this.multiplier)
        }
    }
    drawLine(x,y){
        this.ctx.beginPath()
        this.ctx.lineWidth = 2
        this.ctx.lineCap = "round"
        this.ctx.strokeStyle = this.color
        this.ctx.moveTo(x,-y)
        this.ctx.lineTo(x,y)
        this.ctx.stroke()
    }
}