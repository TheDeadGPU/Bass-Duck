export class AudioManager {
  static instance = null;

  static getInstance(audioElementId) {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(audioElementId);
    }
    return AudioManager.instance;
  }

  constructor(audioElementId) {
    if (AudioManager.instance) {
      return AudioManager.instance;
    }

    this.audioElement = document.getElementById(audioElementId);
    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.isInitialized = false;

    this.audioElement.addEventListener("play", () => this.setup());

    AudioManager.instance = this;
  }

  setup() {
    if (this.isInitialized) return;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = this.audioCtx.createMediaElementSource(this.audioElement);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    this.audioCtx.resume().then(() => {
      this.audioElement.play();
      this.isInitialized = true;
    });
  }

  update() {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getBassLevel() {
    if (!this.dataArray) return 0;
    const bassBins = this.dataArray.slice(0, 10);
    return bassBins.reduce((a, b) => a + b, 0) / bassBins.length;
  }

  getMidHighLevel() {
    if (!this.dataArray) return 0;
    const midBins = this.dataArray.slice(50, 100);
    const highBins = this.dataArray.slice(100, 150);
    const midAvg = midBins.reduce((a, b) => a + b, 0) / midBins.length;
    const highAvg = highBins.reduce((a, b) => a + b, 0) / highBins.length;
    return (midAvg + highAvg) / 2;
  }
}
