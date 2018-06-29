if (!window.AudioContext) {
  alert('No WebAudio support')
} else {
  // window.confirm('Click OK to start')
}

function startBlockMatrix() {
  var button = document.querySelector('.start-button')
  button.style.display = 'none'
  new tm.Core()
  var context = tm.Synth.master.context
  var kick = new Kick(context, gainNode)
  var snare = new Snare(context)
  var now = context.currentTime
  kick.setup()
  kick.trigger(now)
  kick.setLoop(0.5)
  snare.setup()
  snare.trigger(now)
  snare.setLoop(1)

  var fullNode = context.createGain()
  fullNode.gain.value = 0.2
  var gainNode = tm.Synth.master
  gainNode.connect(fullNode)
  kick.gain.connect(fullNode)
  snare.output.connect(fullNode)
  fullNode.connect(context.destination)
}
