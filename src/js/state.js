import notes from './notes.js'

class State {
  constructor() {
    this.refreshRate = 100
    this.minFreq = 80
    this.maxFreq = 16000
    this.fftSize = 16384 // ['32', '64', '128', '256', '512', '1024', '2048', '4096', '8192', '16384', '32768']
    this.smoothing = 0.0 // 0.0-1.0
    this.display = 'Logarithmic'
    this.noteGrid = true
    this.refPitch = '440' // ['432', '434', '436', '438', '440', '442', '444', '446']
    this.canvasOrigin = { x: 0, y: 35 }
    this.paused = false
    this.toggleEvent = new Event('toggleAnimation')
    this.toggleButton = { width: 50, height: 20, x: 0, y: 0 }
    this.notes = notes
  }

  get numBins() {
    return this.fftSize / 2
  }

  get minLog() {
    return Math.log(this.minFreq) / Math.LN10
  }

  get logRange() {
    return Math.log(this.maxFreq) / Math.LN10 - this.minLog
  }

  logPositionX(freq, width) {
    return Math.floor(
      ((Math.log(freq) / Math.LN10 - this.minLog) / this.logRange) * width
    )
  }

  logFreq(pos, width) {
    return Math.pow(
      Math.E,
      Math.LN10 * (this.minLog + (pos * this.logRange) / width)
    )
  }

  centDiff(freqA, freqB) {
    // 100 cents = 1 semitone
    return Math.floor(1200 * Math.log2(freqB / freqA))
  }

  noteName(freq) {
    // Binary search to find note within 50 cents
    let start = 0
    let end = notes[this.refPitch].length - 1
    let current = Math.floor(end / 2)
    let currentFreq
    let diff
    let result

    while (current > start && current < end) {
      currentFreq = this.notes[this.refPitch][current].frequency
      diff = this.centDiff(freq, currentFreq)

      if (diff > 50) {
        end = current
        current = Math.floor((end - start) / 2 + start)
      } else if (diff < -50) {
        start = current
        current = Math.floor((end - start) / 2 + start)
      } else {
        // result = { cents: diff, ...this.notes[this.refPitch][current] }
        result = this.notes[this.refPitch][current]
        return { ...result, cents: diff }
      }
    }
    return { frequency: null, note: '', cents: null }
  }

  // Create a pause event for communication between canvas layers
  toggleAnimation() {
    this.paused = !this.paused
    document.dispatchEvent(this.toggleEvent)
  }
}

// module.exports = { State }

export default State
