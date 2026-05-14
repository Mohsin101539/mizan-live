import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scale, Moon, Zap, Plus, Minus, Info } from 'lucide-react';

interface BodyLogProps {
  weight?: number;
  sleep: number;
  energy: number;
  onUpdateWeight: (val: number) => void;
  onUpdateSleep: (delta: number) => void;
  onUpdateEnergy: (val: number) => void;
  onSave: () => void;
}

export const BodyLog: React.FC<BodyLogProps> = ({ 
  weight, 
  sleep, 
  energy, 
  onUpdateWeight, 
  onUpdateSleep, 
  onUpdateEnergy,
  onSave
}) => {
  const [showBMI, setShowBMI] = useState(false);
  const [weightInput, setWeightInput] = useState(weight?.toString() || '');

  // For BMI demo, assume a height of 175cm if not specified, 
  // but better just show weight tracker as per MVP unless height is in profile
  const height = 1.75; // meters
  const bmi = weight ? (weight / (height * height)).toFixed(1) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Scale className="text-brand-gold" size={20} /> Body Progress
        </h3>
        <button 
          onClick={() => setShowBMI(!showBMI)}
          className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 flex items-center gap-1"
        >
          <Info size={10} /> BMI Info
        </button>
      </div>

      {/* Weight Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Body Weight (kg)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={() => weightInput && onUpdateWeight(parseFloat(weightInput))}
              placeholder="00.0"
              className="w-full h-12 bg-brand-forest/5 rounded-xl px-4 font-black outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
            <span className="text-[10px] font-black opacity-20 mt-1">KG</span>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">Current BMI</label>
          <div className="h-12 flex items-center px-4 bg-brand-gold/10 rounded-xl">
            <span className="text-lg font-black text-brand-gold">{bmi || '--.-'}</span>
          </div>
        </div>
      </div>

      {/* Sleep Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block flex items-center gap-1">
             <Moon size={10} /> Sleep (hrs)
          </label>
          <span className="text-lg font-black">{sleep.toFixed(1)} hrs</span>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => onUpdateSleep(-0.5)}
            className="flex-1 h-12 rounded-xl bg-brand-forest/5 flex items-center justify-center active:scale-95 transition-all text-brand-forest/40"
           >
             <Minus size={20} />
           </button>
           <div className="flex-[3] h-2 bg-brand-forest/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${(sleep / 12) * 100}%` }}
                className="h-full bg-brand-forest"
              />
           </div>
           <button 
            onClick={() => onUpdateSleep(0.5)}
            className="flex-1 h-12 rounded-xl bg-brand-forest/5 flex items-center justify-center active:scale-95 transition-all text-brand-forest/40"
           >
             <Plus size={20} />
           </button>
        </div>
      </div>

      {/* Energy Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block flex items-center gap-1">
          <Zap size={10} /> Energy Level
        </label>
        <div className="flex justify-between">
          {['😴', '😕', '😐', '😊', '🔥'].map((emoji, i) => (
            <button 
              key={i}
              onClick={() => onUpdateEnergy(i + 1)}
              className={`text-2xl w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${energy === i + 1 ? 'bg-brand-gold/20 scale-110 shadow-lg shadow-brand-gold/10' : 'hover:bg-brand-forest/5 opacity-40'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={onSave}
        className="w-full h-[52px] bg-brand-forest text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-brand-forest/20"
      >
        Save Body Log (+10 pts)
      </button>

      {showBMI && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 rounded-2xl border border-blue-100"
        >
          <p className="text-[10px] font-bold text-blue-800 leading-relaxed">
            BMI is an estimate calculated from your weight and height. 
            Healthy range: 18.5 - 24.9. 
            Remember, muscle mass can affect this reading!
          </p>
        </motion.div>
      )}
    </div>
  );
};
