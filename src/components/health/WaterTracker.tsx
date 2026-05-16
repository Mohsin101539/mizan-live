import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WaterTrackerProps {
  glasses: number;
  onAdd: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({ glasses, onAdd }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Droplets className="text-blue-500" size={20} /> {t('health.waterIntake', 'Water Intake')}
        </h3>
        <span className="text-sm font-black opacity-40 uppercase tracking-widest">{glasses} / 8 {t('health.glasses', 'Glasses')}</span>
      </div>

      <div className="flex justify-between gap-2 mb-8 px-1">
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={false}
            animate={{ scale: i === glasses - 1 ? [1, 1.2, 1] : 1 }}
            className={`flex-1 h-12 flex items-center justify-center transition-all duration-300 ${i < glasses ? 'text-blue-500' : 'text-brand-forest/10'}`}
          >
            <div className={`w-full h-full rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${i < glasses ? 'bg-blue-500/10 border-blue-500' : 'border-current'}`}>
               <Droplets size={16} fill={i < glasses ? "currentColor" : "none"} />
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onAdd}
        disabled={glasses >= 8}
        className="w-full h-[52px] bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
      >
        <Plus size={20} /> Add Glass (+5 pts)
      </button>

      {glasses >= 8 && (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-green-600 mt-4">
          Daily goal hit! 🌟 +20 bonus pts
        </p>
      )}
    </div>
  );
};
