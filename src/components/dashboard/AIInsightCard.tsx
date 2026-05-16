import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface AIInsightCardProps {
  insight: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-brand-gold/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4 mb-8 shadow-md"
    >
      <div className="bg-brand-gold/20 p-2 rounded-xl text-brand-gold mt-0.5 shrink-0">
        <Zap size={20} className="fill-brand-gold/50" />
      </div>
      <div className="flex-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-1 flex items-center gap-2">
          Cross-Pillar AI Insight
        </h4>
        <p className="text-brand-forest text-sm leading-relaxed font-bold">
          {insight}
        </p>
      </div>
    </motion.div>
  );
};
