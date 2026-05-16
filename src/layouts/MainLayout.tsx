import React, { Suspense, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav, TabType } from '../components/BottomNav';
import { useFirebase } from '../FirebaseContext';
import { WifiOff, Loader2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VaultViewer } from '../components/deen/VaultViewer';

const ScreenSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
    <div className="relative">
      {/* Outer spinning ring */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="w-24 h-24 rounded-[2rem] border border-brand-forest/10 border-t-brand-gold absolute inset-0"
      />
      {/* Inner pulsing core */}
      <div className="w-24 h-24 bg-brand-forest/5 rounded-[2rem] flex items-center justify-center rotate-12 relative z-10">
        <Loader2 className="animate-spin text-brand-gold/60 -rotate-12" size={32} />
      </div>
      <div className="absolute inset-0 bg-brand-gold/10 rounded-[2rem] animate-ping opacity-30 delay-150" />
    </div>
    
    <div className="space-y-4 flex flex-col items-center w-full max-w-sm px-8">
      {/* Fake headers */}
      <div className="h-4 bg-brand-forest/10 rounded-full w-1/3 animate-pulse" />
      <div className="h-3 bg-brand-forest/5 rounded-full w-2/3 animate-pulse delay-75" />
      
      {/* Fake content blocks */}
      <div className="w-full space-y-3 mt-8">
        <div className="h-16 bg-brand-forest/5 rounded-2xl w-full animate-pulse delay-100" />
        <div className="h-16 bg-brand-forest/5 rounded-2xl w-full animate-pulse delay-150" />
        <div className="h-16 bg-brand-forest/5 rounded-2xl w-full animate-pulse delay-200" />
      </div>
    </div>
  </div>
);

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOffline } = useFirebase();
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  const getActiveTab = (): TabType => {
    const path = location.pathname;
    if (path.startsWith('/deen')) return 'deen';
    if (path.startsWith('/career')) return 'career';
    if (path.startsWith('/health')) return 'health';
    if (path.startsWith('/rewards')) return 'rewards';
    return 'home';
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
  };

  return (
    <div className="viewport-border bg-brand-cream overflow-hidden relative">
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
          >
            <WifiOff size={14} />
            Offline Mode
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 lg:top-12 lg:right-12 z-40 pointer-events-auto">
        <button 
          onClick={() => setIsVaultOpen(true)}
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-brand-forest/10 text-brand-forest hover:bg-brand-forest hover:text-white transition-all flex items-center justify-center hover:scale-105 active:scale-95"
          aria-label="Open Vault"
        >
          <Bookmark size={20} />
        </button>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-4 lg:p-12 lg:pt-12 overflow-y-auto pb-32">
        <Suspense fallback={<ScreenSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:px-12 lg:pb-8 pointer-events-none">
        <nav className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-brand-forest/10 p-4 flex items-center justify-between shadow-2xl pointer-events-auto ring-1 ring-brand-forest/5">
          <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />
        </nav>
      </div>

      <VaultViewer isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
    </div>
  );
};
