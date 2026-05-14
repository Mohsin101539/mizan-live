import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../../FirebaseContext';
import { Plus, CheckSquare, Square, ChevronRight, ChevronDown, Trophy, Trash2, Loader2, Target, ListTodo, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { MIZAN_POINTS } from '../../constants/points';

interface Goal { id: string; title: string; isCompleted: boolean; }
interface SubGoal { id: string; goalId: string; title: string; isCompleted: boolean; }
interface Task { id: string; subGoalId: string; title: string; isCompleted: boolean; }

export const GoalTree: React.FC = () => {
  const { user } = useFirebase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subGoals, setSubGoals] = useState<SubGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [expandedSubGoal, setExpandedSubGoal] = useState<string | null>(null);
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [addingSubGoalFor, setAddingSubGoalFor] = useState<string | null>(null);
  const [addingTaskFor, setAddingTaskFor] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchSubGoals();
      fetchTasks();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'goals');
    }
  };

  const fetchSubGoals = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'subgoals'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setSubGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as SubGoal)));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'subgoals');
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'tasks');
    }
  };

  const addItem = async (type: 'goal' | 'subgoal' | 'task', parentId?: string) => {
    if (!newTitle || !user) return;
    setLoading(true);
    try {
      if (type === 'goal') {
        await addDoc(collection(db, 'goals'), {
          userId: user.uid,
          title: newTitle,
          isCompleted: false,
          targetDate: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
        fetchGoals();
        setIsAddingGoal(false);
      } else if (type === 'subgoal' && parentId) {
        await addDoc(collection(db, 'subgoals'), {
          userId: user.uid,
          goalId: parentId,
          title: newTitle,
          isCompleted: false,
          targetDate: new Date().toISOString()
        });
        fetchSubGoals();
        setAddingSubGoalFor(null);
      } else if (type === 'task' && parentId) {
        await addDoc(collection(db, 'tasks'), {
          userId: user.uid,
          subGoalId: parentId,
          title: newTitle,
          isCompleted: false
        });
        fetchTasks();
        setAddingTaskFor(null);
      }
      setNewTitle('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, type + 's');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (type: 'goals' | 'subgoals' | 'tasks', id: string, current: boolean) => {
    if (!user) return;
    try {
      const pointsMap = {
        goals: 500,
        subgoals: 100,
        tasks: MIZAN_POINTS.CAREER_TASK
      };
      
      const points = pointsMap[type];
      
      await updateDoc(doc(db, type, id), { isCompleted: !current });
      if (!current) {
         await updateDoc(doc(db, 'users', user.uid), { 
           points: increment(points),
           lastActive: serverTimestamp() 
         });
         confetti({ particleCount: Math.min(100, points / 5), spread: 70 });
      }
      if (type === 'goals') fetchGoals();
      if (type === 'subgoals') fetchSubGoals();
      if (type === 'tasks') fetchTasks();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${type}/${id}`);
    }
  };

  const deleteItem = async (type: 'goals' | 'subgoals' | 'tasks', id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, type, id));
      if (type === 'goals') fetchGoals();
      if (type === 'subgoals') fetchSubGoals();
      if (type === 'tasks') fetchTasks();
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${type}/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-brand-forest/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-forest/5 flex items-center justify-center text-brand-forest">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-brand-forest italic">Your Ambitions</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-forest/30">Build your legacy</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setIsAddingGoal(!isAddingGoal);
            setNewTitle('');
          }}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            isAddingGoal ? 'bg-brand-gold text-brand-forest' : 'bg-brand-forest text-white shadow-xl shadow-brand-forest/20'
          }`}
        >
          {isAddingGoal ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Goal</>}
        </button>
      </div>

      <AnimatePresence>
        {isAddingGoal && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-brand-forest p-8 rounded-[40px] shadow-2xl border-2 border-brand-gold/30">
              <input 
                autoFocus
                className="w-full bg-white/10 border-2 border-white/10 p-5 rounded-2xl font-bold text-white outline-none focus:border-brand-gold placeholder:text-white/30 text-lg mb-4"
                placeholder="What is your big goal?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem('goal')}
              />
              <button 
                onClick={() => addItem('goal')}
                disabled={!newTitle || loading}
                className="w-full bg-brand-gold text-brand-forest py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin" size={16} />}
                Establish Milestone
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-[40px] border border-brand-forest/10 p-2 overflow-hidden shadow-sm group">
            <div 
              className={`p-6 rounded-[32px] flex items-center justify-between cursor-pointer transition-all ${goal.isCompleted ? 'bg-brand-forest/5 opacity-60' : 'bg-brand-forest/5 hover:bg-brand-forest/10'}`}
              onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleItem('goals', goal.id, goal.isCompleted); }}
                  className={`${goal.isCompleted ? 'text-green-500' : 'text-brand-forest/20 hover:text-brand-forest'}`}
                >
                  {goal.isCompleted ? <CheckSquare size={28} /> : <Square size={28} />}
                </button>
                <div>
                  <span className={`text-xl font-black tracking-tight ${goal.isCompleted ? 'line-through' : 'text-brand-forest'}`}>
                    {goal.title}
                  </span>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-forest/30">
                      {subGoals.filter(sg => sg.goalId === goal.id).length} Subgoals
                    </span>
                    {(goal as any).createdAt && (goal as any).createdAt.seconds && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold italic">
                        {(() => {
                           const days = Math.floor((Date.now() - ((goal as any).createdAt.seconds * 1000)) / (1000 * 60 * 60 * 24));
                           return days > 0 ? `${days} Days Active` : 'Established Today';
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteItem('goals', goal.id); }}
                  className="p-2 text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <div className={`p-2 rounded-xl bg-brand-forest/5 ${expandedGoal === goal.id ? 'text-brand-gold' : 'text-brand-forest/20'}`}>
                  {expandedGoal === goal.id ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedGoal === goal.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 pt-4"
                >
                  <div className="flex justify-between items-center mb-6 border-b border-brand-forest/5 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-forest/30 italic flex items-center gap-2">
                       <ListTodo size={14} /> Path to completion
                    </p>
                    <button 
                      onClick={() => {
                        setAddingSubGoalFor(addingSubGoalFor === goal.id ? null : goal.id);
                        setNewTitle('');
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-gold flex items-center gap-2 hover:underline"
                    >
                      {addingSubGoalFor === goal.id ? 'Cancel' : <><Plus size={14} /> Add Subgoal</>}
                    </button>
                  </div>

                  {addingSubGoalFor === goal.id && (
                    <div className="mb-6 flex flex-col sm:flex-row gap-2 bg-brand-forest/5 p-3 rounded-2xl">
                       <input 
                         autoFocus
                         className="flex-1 bg-white border border-brand-forest/10 p-3 rounded-xl font-bold text-brand-forest text-sm outline-none"
                         placeholder="Break it down into subgoals..."
                         value={newTitle}
                         onChange={e => setNewTitle(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && addItem('subgoal', goal.id)}
                       />
                       <button 
                         onClick={() => addItem('subgoal', goal.id)}
                         disabled={!newTitle || loading}
                         className="bg-brand-forest text-white px-6 py-3 sm:py-0 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-brand-forest/20 whitespace-nowrap"
                       >
                         {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save Subgoal'}
                       </button>
                    </div>
                  )}

                  <div className="space-y-6">
                    {subGoals.filter(sg => sg.goalId === goal.id).map(subGoal => (
                      <div key={subGoal.id} className="bg-brand-forest/[0.02] rounded-3xl p-4 border border-brand-forest/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleItem('subgoals', subGoal.id, subGoal.isCompleted)}
                              className={`${subGoal.isCompleted ? 'text-green-500' : 'text-brand-forest/20'}`}
                            >
                              {subGoal.isCompleted ? <CheckSquare size={22} /> : <Square size={22} />}
                            </button>
                            <span className={`font-black text-brand-forest ${subGoal.isCompleted ? 'line-through opacity-40 italic' : ''}`}>
                              {subGoal.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => deleteItem('subgoals', subGoal.id)}
                               className="p-2 text-red-500/60 sm:text-red-500/20 sm:hover:text-red-500 transition-colors"
                             >
                               <Trash2 size={14} />
                             </button>
                             <button 
                                onClick={() => {
                                  setAddingTaskFor(addingTaskFor === subGoal.id ? null : subGoal.id);
                                  setNewTitle('');
                                }}
                                className="p-3 rounded-xl bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-brand-forest transition-all"
                                title="Add Task"
                             >
                               <PlusCircle size={20} />
                             </button>
                          </div>
                        </div>

                        <div className="ml-8 space-y-2">
                           {addingTaskFor === subGoal.id && (
                              <div className="mb-4 flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border border-brand-forest/5 shadow-inner">
                                <input 
                                  autoFocus
                                  className="flex-1 bg-brand-forest/5 border border-brand-forest/5 p-3 rounded-xl text-xs font-bold outline-none focus:border-brand-gold"
                                  placeholder="What needs to be done?"
                                  value={newTitle}
                                  onChange={e => setNewTitle(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && addItem('task', subGoal.id)}
                                />
                                <button 
                                  onClick={() => addItem('task', subGoal.id)}
                                  disabled={!newTitle || loading}
                                  className="bg-brand-gold text-brand-forest px-4 py-3 sm:py-0 rounded-xl text-[10px] font-black uppercase whitespace-nowrap shadow-lg shadow-brand-gold/10"
                                >
                                  {loading ? <Loader2 className="animate-spin" size={12} /> : 'Add Task'}
                                </button>
                              </div>
                           )}

                           {tasks.filter(t => t.subGoalId === subGoal.id).map(task => (
                              <div key={task.id} className="flex items-center justify-between group py-1">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => toggleItem('tasks', task.id, task.isCompleted)}
                                    className={`${task.isCompleted ? 'text-green-500/50' : 'text-brand-forest/10 hover:text-brand-forest/40 transition-colors'}`}
                                  >
                                    {task.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                                  </button>
                                  <span className={`text-xs font-bold ${task.isCompleted ? 'line-through opacity-30 italic' : 'text-brand-forest/60'}`}>
                                    {task.title}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => deleteItem('tasks', task.id)}
                                  className="p-2 text-red-500/60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                           ))}
                        </div>
                      </div>
                    ))}
                    {subGoals.filter(sg => sg.goalId === goal.id).length === 0 && !addingSubGoalFor && (
                      <div className="text-center py-8 rounded-3xl border-2 border-dashed border-brand-forest/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-forest/10">No steps defined for this goal</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {goals.length === 0 && !isAddingGoal && (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-brand-forest/10">
            <div className="w-16 h-16 bg-brand-forest/5 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-forest/10">
              <Trophy size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-forest/20">Plant your first seed of success</p>
          </div>
        )}
      </div>
    </div>
  );
};
