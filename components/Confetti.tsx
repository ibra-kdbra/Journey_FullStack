"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export function Confetti({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<confetti.CreateTypes | null>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    if (canvasRef.current && !confettiRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
  }, []);

  useEffect(() => {
    if (trigger && confettiRef.current && !hasFired.current) {
      hasFired.current = true;
      confettiRef.current({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ background: "transparent" }}
    />
  );
}
