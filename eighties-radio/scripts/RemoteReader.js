class RemoteReader {

  constructor(_remoteSourceUrl) {
	  window.audio = new Audio();
    this.context = new(window.AudioContext || window.webkitAudioContext)();
    this.source = context.createMediaElementSource(audio);
  // source.connect(analyser);
  // analyser.connect(context.destination);

    this.audioStack = [];
    this.nextTime = 0;
    this.remoteSourceUrl = _remoteSourceUrl
  }

  read() {
    fetch(this.remoteSourceUrl).then((response) => {
      let reader = response.body.getReader()
      this.readNext(reader)
    })
  }

  readNext(reader) {
  	reader.read().then(({
      value,
      done
    }) => {
    	if (!value) return
      this.context.decodeAudioData(value.buffer, (buffer) => {
        console.log(buffer)
        this.audioStack.push(buffer)
        if (this.audioStack.length) this.scheduleBuffers()
      }, (err) => {
        console.log("err(decodeAudioData): " + err)
      })
      if (done) return
      this.readNext(reader)
    })
  }

  scheduleBuffers() {
    while (this.audioStack.length) {
      var buffer = this.audioStack.shift();
      var source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      if (this.nextTime == 0) this.nextTime = this.context.currentTime + 10000000000; /// add 50ms latency to work well across systems - tune this if you like
      source.start(this.nextTime);
      this.nextTime += source.buffer.duration; // Make the next buffer wait the length of the last buffer before being played
    }
  }
}