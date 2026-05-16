import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scale, Moon, Zap, Plus, Minus, Info, Footprints, Smartphone, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BodyLogProps {
  weight?: number;
  height?: number;
  steps?: number;
  sleep: number;
  energy: number;
  wearableConnected?: boolean;
  wearableProvider?: 'google_fit' | 'apple_health' | null;
  connectingWearable?: boolean;
  onConnectWearable?: (provider: 'google_fit' | 'apple_health') => void;
  onUpdateWeight: (val: number) => void;
  onUpdateHeight: (val: number) => void;
  onUpdateSteps: (val: number) => void;
  onUpdateSleep: (delta: number) => void;
  onUpdateEnergy: (val: number) => void;
  onSave: () => void;
}

export const BodyLog: React.FC<BodyLogProps> = ({ 
  weight, 
  height,
  steps,
  sleep, 
  energy, 
  wearableConnected,
  wearableProvider,
  connectingWearable,
  onConnectWearable,
  onUpdateWeight, 
  onUpdateHeight,
  onUpdateSteps,
  onUpdateSleep, 
  onUpdateEnergy,
  onSave
}) => {
  const { t } = useTranslation();
  const [showBMI, setShowBMI] = useState(false);
  const [weightInput, setWeightInput] = useState(weight?.toString() || '');
  const [heightInput, setHeightInput] = useState(height?.toString() || '');
  const [stepsInput, setStepsInput] = useState(steps?.toString() || '');

  const bmiHeight = height ? height / 100 : 1.75; // convert cm to m
  const bmi = weight ? (weight / (bmiHeight * bmiHeight)).toFixed(1) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Scale className="text-brand-gold" size={20} /> {t('health.logBodyStats', 'Body Progress')}
        </h3>
        <button 
          onClick={() => setShowBMI(!showBMI)}
          className="text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 flex items-center gap-1"
        >
          <Info size={10} /> BMI Info
        </button>
      </div>

      {/* Wearable Connection */}
      {!wearableConnected && (
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1"><Smartphone size={14} /> Connect Wearable</span>
            <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-1 rounded-full font-black uppercase">Auto-sync</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onConnectWearable?.('apple_health')}
              disabled={connectingWearable}
              className="flex-1 bg-white border border-blue-200 text-blue-800 text-[10px] font-black p-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Apple Health
            </button>
            <button 
              onClick={() => onConnectWearable?.('google_fit')}
              disabled={connectingWearable}
              className="flex-1 bg-white border border-blue-200 text-blue-800 text-[10px] font-black p-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Google Fit
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">{t('health.weight', 'Weight')} (kg)</label>
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onBlur={() => weightInput && onUpdateWeight(parseFloat(weightInput))}
              placeholder="00.0"
              className="w-full h-12 bg-brand-forest/5 rounded-xl px-3 font-black text-sm outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">{t('health.height', 'Height')} (cm)</label>
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              onBlur={() => heightInput && onUpdateHeight(parseFloat(heightInput))}
              placeholder="000"
              className="w-full h-12 bg-brand-forest/5 rounded-xl px-3 font-black text-sm outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block">{t('health.bmi', 'BMI')}</label>
          <div className="h-12 flex items-center justify-center bg-brand-gold/10 rounded-xl">
            <span className="text-sm font-black text-brand-gold">{bmi || '--.-'}</span>
          </div>
        </div>
      </div>

      {/* Steps & Sleep Auto/Manual Wrapper */}
      <div className="space-y-6">
        {wearableConnected && (
          <div className="flex items-center justify-between text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-xs font-bold border border-blue-100">
            <span>Synced via {wearableProvider === 'apple_health' ? 'Apple Health' : 'Google Fit'}</span>
            <CheckCircle size={14} />
          </div>
        )}

        {/* Steps Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block flex items-center gap-1">
              <Footprints size={10} /> {t('health.steps', 'Steps')}
            </label>
            {wearableConnected ? (
              <span className="text-lg font-black text-blue-800">{steps || 0}</span>
            ) : null}
          </div>
          {!wearableConnected && (
            <input 
              type="number" 
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              onBlur={() => stepsInput && onUpdateSteps(parseInt(stepsInput, 10))}
              placeholder="e.g. 5000"
              className="w-full h-12 bg-brand-forest/5 rounded-xl px-3 font-black text-sm outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          )}
        </div>

        {/* Sleep Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block flex items-center gap-1">
               <Moon size={10} /> {t('health.sleep', 'Sleep')} ({t('health.hrs', 'hrs')})
            </label>
            <span className={`text-lg font-black ${wearableConnected ? 'text-blue-800' : ''}`}>{sleep.toFixed(1)} {t('health.hrs', 'hrs')}</span>
          </div>
          {!wearableConnected && (
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
          )}
        </div>
      </div>

      {/* Energy Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block flex items-center gap-1">
          <Zap size={10} /> {t('health.energyLevel', 'Energy Level')}
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
        {t('health.logBodyStats', 'Save Body Log')} (+10 pts)
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
