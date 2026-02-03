"use client";

import { music } from "@/lib/sounds";
import { Music, Music2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    const newState = music.toggle();
    setIsPlaying(newState);
  };

  return (
    <motion.button
      onClick={toggleMusic}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-2 rounded-full hover:bg-muted transition-colors border border-border bg-card/50 backdrop-blur-sm"
      aria-label="Toggle music"
    >
      {isPlaying ? (
        <Music className="w-5 h-5 text-primary animate-pulse" />
      ) : (
        <Music2 className="w-5 h-5 text-muted-foreground" />
      )}
    </motion.button>
  );
}
