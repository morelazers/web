function Snare(context) {
  this.context = context;
  this.noiseGain = this.context.createGain()
  this.oscGain = this.context.createGain()
  this.output = this.context.createGain()
  this.noiseGain.connect(this.output)
  this.oscGain.connect(this.output)
};

Snare.prototype.setup = function() {
  this.noise = this.context.createBufferSource();
  this.noise.buffer = this.noiseBuffer();
  var noiseFilter = this.context.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;
  this.noise.connect(noiseFilter);
  // this.noiseEnvelope = this.context.createGain();
  noiseFilter.connect(this.noiseGain);

  this.noiseGain.connect(this.output);
  this.osc = this.context.createOscillator();
  this.osc.type = 'triangle';

  this.osc.connect(this.oscGain);
};


Snare.prototype.noiseBuffer = function() {
  var bufferSize = this.context.sampleRate;
  var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
  var output = buffer.getChannelData(0);

  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

Snare.prototype.trigger = function(time) {
  this.setup();

  this.noiseGain.gain.setValueAtTime(0.3, time);
  this.noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  this.noise.start(time)

  this.osc.frequency.setValueAtTime(100, time);
  this.oscGain.gain.setValueAtTime(0.01, time);
  this.oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  this.osc.start(time)

  this.osc.stop(time + 0.2);
  this.noise.stop(time + 0.3);
};

Snare.prototype.setLoop = function(time) {
  this.loopCount = 0
  setInterval(() => {
    this.trigger(this.context.currentTime)
    if (++this.loopCount % 8 === 0) {
      this.trigger(this.context.currentTime + (time / 2))
    }
  }, time * 1000)
}