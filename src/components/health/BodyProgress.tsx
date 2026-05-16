import React from 'react';
import { motion } from 'motion/react';
import { Ruler, Weight, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BodyProgressProps {
  weight?: number;
  height?: number;
}

export const BodyProgress: React.FC<BodyProgressProps> = ({ weight, height }) => {
  const { t } = useTranslation();
  const bmiHeight = height ? height / 100 : 0;
  const bmi = (weight && bmiHeight) ? (weight / (bmiHeight * bmiHeight)).toFixed(1) : null;
  
  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (val < 25) return { label: 'Healthy', color: 'text-green-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health">
      <h3 className="text-lg font-black flex items-center gap-2 mb-6">
        <TrendingUp className="text-brand-gold" size={20} /> {t('health.bodyProgress', 'Body Progress')}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 opacity-40">
            <Ruler size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{t('health.height', 'Height')}</span>
          </div>
          <p className="text-xl font-black text-brand-forest">{height || '--'} <span className="text-[10px] opacity-40">cm</span></p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 opacity-40">
            <Weight size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{t('health.weight', 'Weight')}</span>
          </div>
          <p className="text-xl font-black text-brand-forest">{weight || '--'} <span className="text-[10px] opacity-40">kg</span></p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 opacity-40">
            <TrendingUp size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{t('health.bmiStatus', 'BMI Status')}</span>
          </div>
          <div>
            <p className="text-xl font-black text-brand-forest">{bmi || '--.-'}</p>
            {bmiInfo && (
              <span className={`text-[8px] font-black uppercase tracking-widest ${bmiInfo.color}`}>
                {bmiInfo.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {bmi && (
        <div className="mt-6 space-y-2">
          <div className="h-1.5 w-full bg-brand-forest/5 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500/30" style={{ width: '18.5%' }} />
            <div className="h-full bg-green-500/30" style={{ width: '6.5%' }} />
            <div className="h-full bg-orange-500/30" style={{ width: '5%' }} />
            <div className="h-full bg-red-500/30" style={{ width: '70%' }} />
          </div>
          <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter opacity-20">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40+</span>
          </div>
        </div>
      )}
    </div>
  );
};
