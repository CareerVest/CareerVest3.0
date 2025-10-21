"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

interface ConfettiAnimationProps {
  trigger?: boolean;
  duration?: number;
  onComplete?: () => void;
}

const COLORS = [
  "#FFD700", // Gold
  "#FFA500", // Orange
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#DDA15E", // Brown
  "#BC6C25", // Dark Brown
  "#E63946", // Crimson
  "#F1FAEE", // White
  "#A8DADC", // Light Blue
  "#457B9D", // Steel Blue
];

export function ConfettiAnimation({ trigger = false, duration = 3000, onComplete }: ConfettiAnimationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      // Generate confetti pieces
      const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360
      }));

      setConfetti(pieces);

      // Clear confetti after duration
      const timer = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(timer);
        setConfetti([]);
      };
    }
  }, [trigger, duration, onComplete]);

  if (confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`
          }}
        >
          <div
            className="animate-confetti-spin"
            style={{
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              animationDuration: `${piece.duration * 0.5}s`
            }}
          />
        </div>
      ))}

      {/* Add custom keyframes via style tag */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--confetti-x, 0px));
            opacity: 0;
          }
        }

        @keyframes confetti-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
          --confetti-x: ${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 40}px;
        }

        .animate-confetti-spin {
          animation: confetti-spin linear infinite;
        }
      `}</style>
    </div>
  );
}
