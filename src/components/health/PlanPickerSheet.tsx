import React from 'react';
import { motion } from 'motion/react';
import { WorkoutPlanId } from '../../types';
import { WORKOUT_PLANS } from '../../constants/workoutPlans';

interface PlanPickerSheetProps {
  selectedPlanId: WorkoutPlanId;
  onSelect: (id: WorkoutPlanId) => void;
  onClose: () => void;
}

export const PlanPickerSheet: React.FC<PlanPickerSheetProps> = ({
  selectedPlanId,
  onSelect,
  onClose
}) => {
  const [selected, setSelected] = React.useState<WorkoutPlanId>(selectedPlanId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[100] p-6 pb-16 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-black text-gray-900 mb-6 text-center">Choose Your Plan</h3>

        <div className="space-y-4 mb-8">
          {WORKOUT_PLANS.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex gap-4 items-start ${
                selected === plan.id 
                  ? 'border-green-500 bg-green-50/50' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === plan.id ? 'border-green-500' : 'border-gray-300'
              }`}>
                {selected === plan.id && <div className="w-3 h-3 bg-green-500 rounded-full" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-black text-gray-900">{plan.name}</h4>
                  {selectedPlanId === plan.id && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{plan.daysPerWeek} days/week · {plan.id === 'sunnah' ? 'Walking-based' : 'No equipment'}</p>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onSelect(selected);
            onClose();
          }}
          className="w-full h-[52px] bg-[#1B4332] text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center shadow-lg shadow-[#1B4332]/20"
        >
          Confirm Selection
        </motion.button>
      </motion.div>
    </>
  );
};
