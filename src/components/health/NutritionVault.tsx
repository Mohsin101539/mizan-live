import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Plus, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NutritionVaultProps {
  pinnedFoods: string[];
  mealsLogged: string[];
  onLogFood: (food: string) => void;
  onUpdatePinned: (foods: string[]) => void;
}

const COMMON_FOODS = [
  'Oatmeal', 'Eggs', 'Protein Shake', 'Chicken Rice', 
  'Apple', 'Dates', 'Banana', 'Greek Yogurt', 
  'Salad', 'Avocado Toast', 'Almonds', 'Smoothie',
  'Lentil Soup', 'Fish', 'Rice & Beans', 'Beef Steak',
  'Toast', 'Hummus', 'Cheese', 'Cereal'
];

export const NutritionVault: React.FC<NutritionVaultProps> = ({ 
  pinnedFoods, 
  mealsLogged, 
  onLogFood, 
  onUpdatePinned 
}) => {
  const { t } = useTranslation();
  const [showVault, setShowVault] = useState(false);
  const [localPinned, setLocalPinned] = useState<string[]>(pinnedFoods);

  // Sync local state when props change (e.g. initial load)
  useEffect(() => {
    setLocalPinned(pinnedFoods);
  }, [pinnedFoods]);

  const togglePin = (food: string) => {
    let newPinned;
    if (localPinned.includes(food)) {
      newPinned = localPinned.filter(f => f !== food);
    } else {
      if (localPinned.length >= 5) {
        alert("You can only pin up to 5 items for quick access.");
        return;
      }
      newPinned = [...localPinned, food];
    }
    setLocalPinned(newPinned); // Optimistic UI update
    onUpdatePinned(newPinned); // Backend update
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-forest/5 font-health">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black flex items-center gap-2">
          <Utensils className="text-orange-500" size={20} /> {t('health.nutritionVault', 'Nutrition Vault')}
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
          {mealsLogged.length} logged
        </span>
      </div>

      {/* Pinned Quick-Add grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {localPinned.map(food => {
          const loggedToday = mealsLogged.filter(m => m === food).length;
          return (
            <button 
              key={food}
              onClick={() => onLogFood(food)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:bg-brand-forest/5 bg-brand-forest/5 border-transparent`}
            >
              <span className="text-xs font-black truncate">{food}</span>
              {loggedToday > 0 && (
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {loggedToday > 1 ? `x${loggedToday}` : <CheckCircle2 size={12} />}
                </div>
              )}
            </button>
          );
        })}
        <button 
          onClick={() => setShowVault(true)}
          className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-brand-forest/20 text-brand-forest/40 hover:text-brand-forest/60 hover:bg-brand-forest/5 transition-all justify-center"
        >
          <Plus size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">More</span>
        </button>
      </div>

      {/* Full Vault Modal */}
      <AnimatePresence>
        {showVault && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col font-health"
          >
            <header className="p-6 flex justify-between items-center border-b border-brand-forest/10">
              <h2 className="text-2xl font-black">{t('health.editVault', 'Edit Nutrition Vault')}</h2>
              <button onClick={() => setShowVault(false)} className="p-2 bg-brand-forest/5 rounded-full hover:bg-brand-forest/10">
                <X size={20} />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm font-bold border border-orange-100">
                Pin up to 5 foods to your quick-log dashboard for 1-tap logging. Say goodbye to manual typing!
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Common Habits</h3>
                <div className="flex flex-wrap gap-2">
                  {COMMON_FOODS.map(food => {
                    const isPinned = localPinned.includes(food);
                    return (
                      <button
                        key={food}
                        onClick={() => togglePin(food)}
                        className={`text-xs font-black px-4 py-2 rounded-full transition-all border-2 ${isPinned ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' : 'bg-brand-forest/5 text-brand-forest border-transparent hover:bg-brand-forest/10'}`}
                      >
                        {food} {isPinned && '📌'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 pb-32 border-t border-brand-forest/10">
              <button 
                onClick={() => setShowVault(false)}
                className="w-full h-[52px] bg-brand-forest text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
              >
                 Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
