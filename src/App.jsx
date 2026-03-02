import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, FileText, BookOpen, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen dan tab yang di-import
import SplashScreen from './components/SplashScreen';
import NavButton from './components/NavButton';
import CalculatorTab from './tabs/CalculatorTab';
import TheoryTab from './tabs/TheoryTab';
import LearnTab from './tabs/LearnTab';
import QuizTab from './tabs/QuizTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [isLoading, setIsLoading] = useState(true);

  // --- GLOBAL STATE FOR CACHING ---
  const [calcState, setCalcState] = useState({
    algo: 'vigenere', text: '', output: '', displayedOutput: '',
    isProcessing: false, error: '', keyStr: 'KUNCI', keyA: '5',
    keyB: '8', hillMat: '3,3,2,5', enigmaPos: 'AAA', stepData: null, showSteps: false
  });

  const [theoryState, setTheoryState] = useState({ selectedAlgo: 'vigenere' });
  const [learnState, setLearnState] = useState({ selectedCategory: 'vigenere' });
  const [quizState, setQuizState] = useState({ step: 0, correctCount: 0, isFinished: false, selectedOpt: null });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/50 to-pink-50/50 text-slate-800 font-sans pb-20 md:pb-0"
        >
          {/* Mobile Top Navbar */}
          <div className="md:hidden fixed top-0 w-full h-14 bg-white/80 backdrop-blur-xl z-40 flex items-center justify-center border-b border-white/60 shadow-sm">
             <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 flex items-center gap-1.5">
               <Shield size={18} className="text-purple-600" /> CryptoLearn
             </h1>
          </div>

          {/* Structured Desktop Sidebar & Mobile Bottom Nav */}
          <nav className="fixed bottom-0 md:top-0 md:left-0 w-full md:w-24 lg:w-28 md:h-screen bg-white/90 md:bg-white/50 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-slate-200/60 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] md:shadow-2xl z-50 flex md:flex-col justify-around md:justify-start items-center p-1.5 pb-4 md:py-8 gap-1 md:gap-6 transition-all">
            <div className="hidden md:flex flex-col items-center gap-2 mb-6 group cursor-pointer relative">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                <Shield size={28} className="text-white" />
              </motion.div>
            </div>
            
            <div className="flex md:flex-col w-full justify-around md:justify-center gap-1 md:gap-3 px-1 md:px-3">
              <NavButton icon={<RefreshCw size={18} md={24} />} label="Alat" active={activeTab === 'kalkulator'} onClick={() => setActiveTab('kalkulator')} />
              <NavButton icon={<FileText size={18} md={24} />} label="Teori" active={activeTab === 'teori'} onClick={() => setActiveTab('teori')} />
              <NavButton icon={<BookOpen size={18} md={24} />} label="Belajar" active={activeTab === 'belajar'} onClick={() => setActiveTab('belajar')} />
              <NavButton icon={<BrainCircuit size={18} md={24} />} label="Kuis" active={activeTab === 'kuis'} onClick={() => setActiveTab('kuis')} />
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="relative max-w-[90rem] mx-auto p-3 sm:p-5 md:p-8 pt-20 md:pt-10 md:pl-32 lg:pl-40 min-h-screen overflow-x-hidden">
            <div className="fixed top-0 right-0 w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] bg-purple-300/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none mix-blend-multiply animate-pulse-slow"></div>
            <div className="fixed bottom-0 left-0 md:left-20 w-[15rem] h-[15rem] md:w-[30rem] md:h-[30rem] bg-pink-300/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none mix-blend-multiply animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <header className="mb-6 md:mb-10 hidden md:block text-left">
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                Crypto<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Learn</span>
              </h1>
              <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
                Pelajari, simulasikan, dan uji kemampuan Anda dalam memahami algoritma enkripsi bersejarah.
              </p>
            </header>

            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
                  {activeTab === 'kalkulator' && <CalculatorTab state={calcState} setState={setCalcState} />}
                  {activeTab === 'teori' && <TheoryTab state={theoryState} setState={setTheoryState} />}
                  {activeTab === 'belajar' && <LearnTab state={learnState} setState={setLearnState} />}
                  {activeTab === 'kuis' && <QuizTab state={quizState} setState={setQuizState} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Styles */}
          <style dangerouslySetInnerHTML={{__html: `
            .glass-panel { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05); }
            .glass-card { background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 100%); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.9); }
            .glass-input { background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: inset 0 2px 4px rgba(0,0,0,0.01); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .glass-input:focus { background: rgba(255, 255, 255, 1); outline: none; border-color: rgba(168, 85, 247, 0.6); box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15), inset 0 2px 4px rgba(0,0,0,0.01); }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            .animate-float { animation: float 4s ease-in-out infinite; }
            @keyframes slide-down { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.05); opacity: 0.5; } }
            .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
          `}} />
        </motion.div>
      )}
    </>
  );
}