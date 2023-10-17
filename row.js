class Row{
    constructor(color,bgColor){
        this.ROW_CONTROLS_DIV = document.createElement('div')
        this.ROW_DIV = document.createElement('div')
        this.GAIN_INPUT = document.createElement('input')

        this.color = color
        this.bgColor = '#69330a'
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
    calibrateTracks(){
        for (let track of this.tracks){
            track.calibrateGraph()
            track.drawGraph(this.color)
        }
    }
    addTrack(track){
        track.createSourceNode(this.gainNode)
        track.drawGraph(this.color,this.bgColor)
        this.tracks.push(track)
    }

    createEventListeners(){
        this.boundSetGain = () => this.setGain()
        this.GAIN_INPUT.addEventListener('input',this.boundSetGain,false)
    }
    setGain(){
        this.gainNode.gain.value = parseFloat(this.GAIN_INPUT.value)
    }

}