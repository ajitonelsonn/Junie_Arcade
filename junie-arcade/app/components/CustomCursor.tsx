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

    const handleMouseDown = () => {
      setIsClicking(true);
    };
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
            {/* Outer Tactical Brackets */}
            <motion.div
              style={{
                translateX: cursorXSpring,
                translateY: cursorYSpring,
                left: -20,
                top: -20,
              }}
              animate={{ 
                scale: isClicking ? 0.8 : (isPointer ? 1.2 : 1),
                rotate: isPointer ? 135 : 0,
              }}
              className="absolute w-10 h-10 flex items-center justify-center pointer-events-none"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#ff4655] shadow-[0_0_8px_rgba(255,70,85,0.5)]" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00eeff] shadow-[0_0_8px_rgba(0,238,255,0.5)]" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#c284f9] shadow-[0_0_8px_rgba(194,132,249,0.5)]" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white opacity-50" />
              
              {/* Hexagonal Inner Frame */}
              <div 
                className="absolute inset-2 border border-white/10"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />
            </motion.div>

            {/* Central Crosshair / Dot */}
            <motion.div
              style={{
                translateX: cursorX,
                translateY: cursorY,
                left: -4,
                top: -4,
              }}
              animate={{ 
                scale: isClicking ? 1.5 : 1,
              }}
              className="absolute w-2 h-2 flex items-center justify-center"
            >
              {/* Center Dot */}
              <motion.div 
                animate={{ 
                  backgroundColor: isPointer ? '#ff4655' : '#00eeff',
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full shadow-[0_0_10px_currentColor]" 
              />
              
              {/* Crosshair lines */}
              <div className="absolute w-4 h-[1px] bg-white/30" />
              <div className="absolute w-[1px] h-4 bg-white/30" />
            </motion.div>

            {/* Diamond Decoration */}
            <motion.div
              style={{
                translateX: cursorXSpring,
                translateY: cursorYSpring,
                left: 12,
                top: 12,
              }}
              animate={{ 
                scale: isPointer ? 1 : 0,
                opacity: isPointer ? 1 : 0,
                rotate: 45
              }}
              className="absolute w-1.5 h-1.5 border border-[#ff4655] bg-[#ff4655]/20"
            />

            {/* Status Label */}
            <motion.div
              style={{
                translateX: cursorX,
                translateY: cursorY,
                left: 24,
                top: -12,
              }}
              animate={{ 
                opacity: isVisible ? 1 : 0,
                x: isPointer ? 10 : 0
              }}
              className="absolute pointer-events-none"
            >
              <div className="flex flex-col gap-0.5 font-black uppercase italic tracking-tighter">
                <div className="flex items-center gap-1">
                  <span className="text-[6px] text-white/40">SYS.LVL</span>
                  <span className="text-[6px] text-white/60">01</span>
                </div>
                <div className={`text-[8px] px-1.5 py-0.5 ${isPointer ? 'bg-[#ff4655] text-white' : 'bg-white/10 text-white/70'}`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
                >
                  {isPointer ? 'TARGET.READY' : (isClicking ? 'COMMAND.EXEC' : 'SCANNING...')}
                </div>
                <div className="text-[6px] text-white/30 ml-1">
                   {isPointer ? 'LINK.ESTABLISHED' : 'SYS.STANDBY'}
                </div>
                {isPointer && (
                  <div className="w-full h-[1px] bg-[#ff4655]/50 mt-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="h-full bg-[#ff4655]"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
