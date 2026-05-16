import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PointsToastProps {
  points: number;
  message: string;
  visible: boolean;
  onHide: () => void;
}

export const PointsToast: React.FC<PointsToastProps> = ({
  points,
  message,
  visible,
  onHide
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-50 bg-[#1B4332] text-white px-6 py-3 rounded-full font-black text-sm shadow-2xl flex items-center gap-2 max-w-[90vw] whitespace-nowrap"
        >
          ⚡ +{points} pts · {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
