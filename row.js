class Row{
    constructor(color){
        this.ROW_CONTROLS_DIV = document.createElement('div')
        this.ROW_DIV = document.createElement('div')
        this.GAIN_INPUT = document.createElement('input')

        this.color = color
        this.tracks = []
        this.gainNode = AUDIO_CTX.createGain()

        this.createEventListeners()
        this.gainNode.connect(AUDIO_CTX.destination)
    }

    createRowControls(){
        this.GAIN_INPUT.setAttribute('type','range')
        this.GAIN_INPUT.setAttribute('min','0')
        this.GAIN_INPUT.setAttribute('max','1')
        this.GAIN_INPUT.setAttribute('step','0.1')
        this.GAIN_INPUT.setAttribute('value','1')
        this.ROW_CONTROLS_DIV.setAttribute('class','row-controls')
        this.ROW_CONTROLS_DIV.appendChild(this.GAIN_INPUT)
        return this.ROW_CONTROLS_DIV
    }
    createRow(){
        this.ROW_DIV.setAttribute('class','row')
        return this.ROW_DIV
    }
    startTracks(startTime){
        for (let track of this.tracks){
            track.startSourceNode(startTime)
        }
    }
    stopTracks(){
        for (let track of this.tracks){
            track.stopSourceNode()
            track.createSourceNode(this.gainNode)
        }
    }
    addTrack(track){
        this.ROW_DIV.appendChild(track.GRAPH_DIV)
        this.tracks.push(track)
        track.createEventListeners()
        track.createSourceNode(this.gainNode)
        track.calibrateGraph()
        track.drawGraph(this.color)
    }

    createEventListeners(){
        this.boundSetGain = () => this.setGain()
        this.GAIN_INPUT.addEventListener('input',this.boundSetGain,false)
    }
    setGain(){
        this.gainNode.gain.value = parseFloat(this.GAIN_INPUT.value)
    }

}
