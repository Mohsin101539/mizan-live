import React from 'react';
import { Home, Moon, Briefcase, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type TabType = 'home' | 'deen' | 'career' | 'health' | 'rewards';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'deen', icon: Moon, label: 'Deen' },
  { id: 'career', icon: Briefcase, label: 'Career' },
  { id: 'health', icon: Heart, label: 'Health' },
  { id: 'rewards', icon: Star, label: 'Profile' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
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
