function Kick(context, dest) {
  this.context = context
  this.dest = dest
  this.gain = this.context.createGain()
}

Kick.prototype.setup = function() {
  this.osc = this.context.createOscillator()
  this.osc.connect(this.gain)
}

Kick.prototype.trigger = function(time) {
  this.setup()

  this.osc.frequency.setValueAtTime(250, time)
  this.gain.gain.setValueAtTime(2, time)

  this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3)
  this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3)

  this.osc.start(time)

  this.osc.stop(time + 0.1)
}

Kick.prototype.setLoop = function(time, offset) {
  this.loopCount = offset || 0
  setInterval(() => {
    this.trigger(this.context.currentTime)
    if (++this.loopCount % 2 === 0) {
      this.trigger(this.context.currentTime + time / 4)
    }
  }, time * 1000)
}
