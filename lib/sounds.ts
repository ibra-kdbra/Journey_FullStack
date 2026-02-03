// Sound effects using Web Audio API (no external files needed)
export function playSound(type: "correct" | "wrong" | "timeout") {
  if (typeof window === "undefined") return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0.1; // Low volume
    
    switch (type) {
      case "correct":
        // Happy ascending tone
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        oscillator.type = "sine";
        break;
      case "wrong":
        // Sad descending tone
        oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
        oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.15); // D4
        oscillator.type = "triangle";
        break;
      case "timeout":
        // Buzzer sound
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.type = "sawtooth";
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Cleanup
    setTimeout(() => {
      audioContext.close();
    }, 500);
  } catch (e) {
    // Audio not supported, fail silently
    console.log("Audio not available");
  }
}

// Background Music Controller
class MusicController {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private timerID: number | undefined;
  private tempo: number = 120;
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private currentNote: number = 0;
  
  // Retro "Fun" Melody (C Major Pentatonic)
  private melody = [
    { note: 261.63, len: 0.25 }, // C4
    { note: 329.63, len: 0.25 }, // E4
    { note: 392.00, len: 0.25 }, // G4
    { note: 440.00, len: 0.25 }, // A4
    { note: 523.25, len: 0.25 }, // C5
    { note: 440.00, len: 0.25 }, // A4
    { note: 392.00, len: 0.25 }, // G4
    { note: 329.63, len: 0.25 }, // E4
  ];

  constructor() {
    this.nextNote = this.nextNote.bind(this);
    this.scheduleNote = this.scheduleNote.bind(this);
    this.scheduler = this.scheduler.bind(this);
  }

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
    this.currentNote = (this.currentNote + 1) % this.melody.length;
  }

  private scheduleNote(noteIndex: number, time: number) {
    if (!this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    const note = this.melody[noteIndex];
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    // Retro 8-bit sound
    osc.type = "square";
    osc.frequency.value = note.note;
    
    // Envelope
    gain.gain.setValueAtTime(0.05, time); // Low volume background
    gain.gain.exponentialRampToValueAtTime(0.01, time + note.len);
    
    osc.start(time);
    osc.stop(time + note.len);
  }

  private scheduler() {
    if (!this.isPlaying || !this.audioContext) return;

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentNote, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(this.scheduler, this.lookahead);
  }

  public start() {
    if (this.isPlaying) return;
    
    this.initAudio();
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.isPlaying = true;
    this.currentNote = 0;
    this.nextNoteTime = this.audioContext!.currentTime + 0.05;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID) clearTimeout(this.timerID);
  }

  public toggle() {
    if (this.isPlaying) this.stop();
    else this.start();
    return this.isPlaying;
  }
  
  public get state() {
    return this.isPlaying;
  }
}

export const music = new MusicController();
