import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

const ConfettiExplosion: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const colors = ['#A3B18A', '#FDEEAD', '#F0E1B9', '#F2C94C', '#2F80ED'];
  
  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: 50 + Math.random() * 20 - 10, // centered with slight variation
        y: 40 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
      });
    }
    
    setPieces(newPieces);
    
    // Clean up confetti after animation
    const timer = setTimeout(() => {
      setPieces([]);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          style={{
            position: 'absolute',
            top: `${piece.y}%`,
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 0.4}px`,
            backgroundColor: piece.color,
            borderRadius: '2px',
            rotate: `${piece.rotation}deg`,
          }}
          initial={{ scale: 0 }}
          animate={{
            y: [0, 400 + Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 400],
            rotate: `${piece.rotation + (Math.random() - 0.5) * 720}deg`,
            scale: [0, 1, 1, 0.5, 0],
            opacity: [0, 1, 1, 0.8, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: [0.23, 0.44, 0.25, 0.99],
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiExplosion;