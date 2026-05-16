import React from 'react';
import { FocusTimer } from './FocusTimer';
import { GoalTree } from './GoalTree';
import { TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const CareerScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="pt-4 space-y-12">
      <header className="flex justify-between items-start pr-14 lg:pr-0">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-forest italic leading-none">{t('career.pillarTitle', 'Career Pillar')}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/30 mt-2">{t('career.pillarSubtitle', 'Professional Growth & Master Skills')}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F]/10 flex items-center justify-center text-[#1E3A5F]">
          <Briefcase size={24} />
        </div>
      </header>

      <section className="bg-white rounded-3xl shadow-xl border border-brand-forest/10 p-8">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/40">{t('career.focusMode', 'Focus Mode')}</h2>
        </div>
        <FocusTimer />
      </section>

      <section className="pb-12">
        <GoalTree />
      </section>
    </div>
  );
};
