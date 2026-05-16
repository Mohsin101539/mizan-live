import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, X, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../../FirebaseContext';

interface VaultItem {
  id: string;
  arabic: string;
  timestamp: any;
}

export const VaultViewer: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useFirebase();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadVaultItems();
    }
  }, [isOpen, user]);

  const loadVaultItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users', user.uid, 'vault'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as VaultItem));
      setItems(fetched);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}/vault`);
    } finally {
      setLoading(false);
    }
  };

  const removeVaultItem = async (itemId: string) => {
    if (!user) return;
    try {
      setItems(prev => prev.filter(i => i.id !== itemId));
      await deleteDoc(doc(db, 'users', user.uid, 'vault', itemId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/vault/${itemId}`);
      loadVaultItems(); // Rollback on failure
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col font-health"
        >
          <header className="p-6 flex justify-between items-center border-b border-brand-forest/10 bg-brand-forest text-white">
            <h2 className="text-2xl font-black flex items-center gap-2">
               <Bookmark size={24} /> {t('dashboard.vault', 'Haptic Vault')}
            </h2>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white">
              <X size={20} />
            </button>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6 bg-brand-forest/5">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-brand-forest" size={32} />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
                <Bookmark size={64} className="mb-4" />
                <p className="text-xl font-black">Your Vault is Empty</p>
                <p className="font-bold">Long-press on a Daily Reflection to save it here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-brand-forest/10 relative group">
                    <button 
                      onClick={() => removeVaultItem(item.id)}
                      className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <p className="text-2xl arabic-text text-brand-gold text-center mb-4 pb-4 border-b border-brand-forest/5">
                      {item.arabic}
                    </p>
                    <p className="text-sm leading-relaxed text-brand-forest/80 font-bold text-center">
                      {t(`hadith.${item.id}` as any)}
                    </p>
                    {item.timestamp?.toDate && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-forest/30 text-center mt-4 pt-4 border-t border-brand-forest/5">
                        Saved on {item.timestamp.toDate().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
