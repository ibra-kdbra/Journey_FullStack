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
