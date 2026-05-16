import React from 'react';
import { Home, Moon, Briefcase, Heart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type TabType = 'home' | 'deen' | 'career' | 'health' | 'rewards';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: t('nav.home', 'Home') },
    { id: 'deen', icon: Moon, label: t('nav.deen', 'Deen') },
    { id: 'career', icon: Briefcase, label: t('nav.career', 'Career') },
    { id: 'health', icon: Heart, label: t('nav.health', 'Health') },
    { id: 'rewards', icon: Star, label: t('nav.rewards', 'Profile') },
  ];

  return (
    <div className="flex items-center flex-1 justify-around h-12">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive ? 'text-brand-forest scale-110' : 'text-brand-forest/30 hover:text-brand-forest/60'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
            <span className={`text-[9px] font-black mt-1 uppercase tracking-[0.1em] transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
