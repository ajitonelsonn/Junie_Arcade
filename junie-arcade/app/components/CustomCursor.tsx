'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const cursorXSpring = useSpring(cursorX, { damping: 20, stiffness: 300 });
  const cursorYSpring = useSpring(cursorY, { damping: 20, stiffness: 300 });

  useEffect(() => {
    // Hide on touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      // Check if cursor should be hidden (e.g., during gameplay)
      const shouldHide = document.body.classList.contains('hide-custom-cursor');
      if (shouldHide) {
        if (isVisible) setIsVisible(false);
        return;
      }

      // Use direct set for core, spring for outer
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const isClickable = 
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('#game-arena') ||
        target.closest('#phaser-game-container') ||
        target.tagName === 'CANVAS';
      
      setIsPointer(!!isClickable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Outer Ring - Tactical Bracket Style */}
            <motion.div
              style={{
                translateX: cursorXSpring,
                translateY: cursorYSpring,
                left: -24,
                top: -24,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isClicking ? 0.8 : (isPointer ? 1.25 : 1),
                opacity: 1,
                rotate: isPointer ? 135 : (isClicking ? -45 : 0)
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-12 h-12 flex items-center justify-center"
            >
              {/* Corner Brackets with Glow */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ff4655] drop-shadow-[0_0_5px_#ff4655]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00eeff] drop-shadow-[0_0_5px_#00eeff]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#c284f9] drop-shadow-[0_0_5px_#c284f9]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white drop-shadow-[0_0_5px_white]" />
              
              {/* Hexagonal Inner Frame (Subtle) */}
              <div 
                className="absolute inset-2 border border-white/10 opacity-40"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />

              {/* Scan Line effect in cursor */}
              <motion.div 
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-full h-[1.5px] bg-white/30 blur-[1px] relative z-20"
              />
            </motion.div>

            {/* Inner Core - Crosshair Dot */}
            <motion.div
              style={{
                translateX: cursorX,
                translateY: cursorY,
                left: -5,
                top: -5,
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: isClicking ? 1.4 : 1,
                backgroundColor: isPointer ? '#ff4655' : '#00eeff',
                boxShadow: isPointer 
                  ? '0 0 15px #ff4655, 0 0 30px #ff4655' 
                  : '0 0 15px #00eeff, 0 0 30px #00eeff'
              }}
              className="absolute w-2.5 h-2.5 rounded-full z-10 flex items-center justify-center"
            >
              {/* Core pulse effect */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-white"
              />
            </motion.div>

            {/* Tactical Crosshair Lines - Extended and Sharper */}
            <motion.div
              style={{
                translateX: cursorX,
                translateY: cursorY,
                left: -20,
                top: -20,
              }}
              animate={{ 
                rotate: isPointer ? 45 : (isClicking ? 90 : 0),
                opacity: isPointer ? 1 : 0.4,
                scale: isPointer ? 1.1 : 1
              }}
              className="absolute w-10 h-10"
            >
              <div className="absolute top-1/2 left-0 w-3 h-[2px] bg-white/60 -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 w-3 h-[2px] bg-white/60 -translate-y-1/2" />
              <div className="absolute top-0 left-1/2 w-[2px] h-3 bg-white/60 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-[2px] h-3 bg-white/60 -translate-x-1/2" />
            </motion.div>

            {/* Status Labels - Rotating Data Readout Aesthetic */}
            <motion.div
              style={{
                translateX: cursorX,
                translateY: cursorY,
                left: 28,
                top: -10,
              }}
              animate={{ 
                opacity: isPointer ? 1 : 0.6,
                x: isPointer ? 5 : 0
              }}
              className="absolute pointer-events-none flex flex-col gap-0.5"
            >
              <div className="text-[7px] font-black text-white/40 tracking-[0.2em] uppercase">
                {isPointer ? 'LINK.ESTABLISHED' : (isClicking ? 'SYSTEM.ACTIVE' : 'SCANNING...')}
              </div>
              <div className={`text-[9px] font-black text-white px-1.5 py-0.5 skew-x-[-15deg] tracking-tight ${(isPointer || isClicking) ? 'bg-[#ff4655]' : 'bg-white/10'}`}>
                {isPointer ? 'TARGET.READY' : (isClicking ? 'COMMAND.EXEC' : 'SYS.STANDBY')}
              </div>
              {(isPointer || isClicking) && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-[1px] bg-[#ff4655]" 
                />
              )}
            </motion.div>

            {/* Animated Diamond Decor */}
            <motion.div
              style={{
                translateX: cursorX,
                translateY: cursorY,
                left: -32,
                top: 24,
              }}
              animate={{ 
                rotate: 45,
                scale: isPointer ? 1.2 : 0.8,
                opacity: isPointer ? 0.8 : 0.3
              }}
              className="absolute w-2 h-2 border border-white/50"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
