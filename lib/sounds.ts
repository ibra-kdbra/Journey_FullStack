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

// Background Music Controller (YouTube version)
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

class MusicController {
  private player: any = null;
  private isPlaying: boolean = false;
  private videoId: string = "6fxxghNzKmM";
  private isApiReady: boolean = false;

  constructor() {
    this.loadApi();
  }

  private loadApi() {
    if (typeof window === "undefined") return;
    
    // Check if script already exists
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      this.isApiReady = true;
      this.initPlayer();
    };
  }

  private initPlayer() {
    if (typeof window === "undefined" || !window.YT || !this.isApiReady) return;

    // Create a container if it doesn't exist
    let container = document.getElementById("youtube-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "youtube-player-container";
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "1px";
      container.style.height = "1px";
      document.body.appendChild(container);
    }

    this.player = new window.YT.Player("youtube-player-container", {
      height: "0",
      width: "0",
      videoId: this.videoId,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: this.videoId,
        controls: 0,
        showinfo: 0,
        autohide: 1,
        modestbranding: 1,
        vq: "small",
      },
      events: {
        onReady: (event: any) => {
          if (this.isPlaying) {
            event.target.playVideo();
            event.target.setVolume(20);
          }
        },
      },
    });
  }

  public start() {
    this.isPlaying = true;
    if (this.player && typeof this.player.playVideo === "function") {
      this.player.playVideo();
      this.player.setVolume(20); // 20% volume for background
    } else if (!this.player) {
      this.initPlayer();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.player && typeof this.player.pauseVideo === "function") {
      this.player.pauseVideo();
    }
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public get state() {
    return this.isPlaying;
  }
}

export const music = new MusicController();
