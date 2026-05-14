import React, { useState } from 'react';
import { SalatTracker } from './SalatTracker';
import { AdhkarSection } from './AdhkarSection';
import { SunnahTracker } from './SunnahTracker';
import { motion } from 'motion/react';

type DeenTab = 'salat' | 'adhkar' | 'sunnah';

export const DeenScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<DeenTab>('salat');

  return (
    <div className="pt-4 space-y-8">
      <header>
        <h1 className="text-4xl font-display font-black text-brand-forest italic">Deen Pillar</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/30 mt-1">Spiritual Excellence & Prophetic Sunnah</p>
      </header>

      <div>
        <div className="flex bg-brand-forest/5 p-1.5 rounded-2xl border border-brand-forest/5">
          {(['salat', 'adhkar', 'sunnah'] as DeenTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeSubTab === tab 
                  ? 'bg-brand-forest text-white shadow-2xl' 
                  : 'text-brand-forest/40 hover:text-brand-forest/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-12">
        {activeSubTab === 'salat' && <SalatTracker />}
        {activeSubTab === 'adhkar' && <AdhkarSection />}
        {activeSubTab === 'sunnah' && <SunnahTracker />}
      </div>
    </div>
  );
};
