import React from 'react';
import { motion } from 'framer-motion';
import { Award, RefreshCw, BrainCircuit } from 'lucide-react';
import { quizData } from '../data/quizData';

export default function QuizTab({ state, setState }) {
  const { step, correctCount, isFinished, selectedOpt } = state;
  const updateState = (updates) => setState({ ...state, ...updates });

  const handleAnswer = (index) => {
    if (selectedOpt !== null) return; 

    updateState({ selectedOpt: index });
    
    setTimeout(() => {
      const isCorrect = index === quizData[step].a;
      
      if (step < quizData.length - 1) { 
        updateState({ 
            step: step + 1, 
            selectedOpt: null,
            correctCount: isCorrect ? correctCount + 1 : correctCount
        }); 
      } else {
        updateState({ 
            isFinished: true,
            correctCount: isCorrect ? correctCount + 1 : correctCount
        });
      }
    }, 800);
  };

  const resetQuiz = () => { 
    updateState({ step: 0, correctCount: 0, isFinished: false, selectedOpt: null }); 
  };

  if (isFinished) {
    const finalScore = Math.round((correctCount / quizData.length) * 100);

    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] text-center max-w-2xl mx-auto space-y-6 md:space-y-8 shadow-2xl">
        <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full shadow-[0_0_40px_rgba(251,146,60,0.4)] animate-float mb-2 md:mb-4">
          <Award size={48} className="text-white drop-shadow-lg md:w-[64px] md:h-[64px]" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-1 md:mb-2">Misi Selesai!</h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium">Anda telah menyelesaikan tes kriptografi.</p>
        </div>
        <div className="py-4 md:py-6 bg-white/50 rounded-2xl md:rounded-3xl border border-white/60">
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Skor</p>
          <p className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">{finalScore}</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetQuiz} className="bg-slate-800 text-white px-8 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-xl text-sm md:text-lg inline-flex items-center gap-2 md:gap-3">
          <RefreshCw size={18} className="md:w-[20px] md:h-[20px]" /> Coba Lagi
        </motion.button>
      </motion.div>
    );
  }

  const q = quizData[step];

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
      <div className="flex justify-between items-center border-b border-purple-200/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-indigo-100 rounded-xl md:rounded-2xl text-indigo-600 shadow-inner">
            <BrainCircuit size={20} className="md:w-[24px] md:h-[24px]" />
          </div>
          <div><h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Uji Kemampuan</h2></div>
        </div>
        <div className="bg-white/60 shadow-sm text-purple-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest">{step + 1} / {quizData.length}</div>
      </div>

      <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 bg-purple-100 w-full">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" initial={{ width: 0 }} animate={{ width: `${((step + 1) / quizData.length) * 100}%` }} transition={{ duration: 0.5 }}></motion.div>
        </div>
        <h3 className="text-xl md:text-3xl font-extrabold text-slate-800 mb-6 md:mb-10 leading-tight mt-4 md:mt-6">{q.q}</h3>
        
        <div className="space-y-3 md:space-y-4">
          {q.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border-2 font-bold text-sm md:text-lg transition-all duration-300 flex items-center justify-between group ";
            if (selectedOpt === null) btnClass += "bg-white/50 border-white/80 hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg text-slate-700 hover:-translate-y-0.5";
            else if (idx === q.a) btnClass += "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-md transform scale-[1.02]"; 
            else if (idx === selectedOpt) btnClass += "bg-rose-100 border-rose-400 text-rose-800 transform scale-[0.98]"; 
            else btnClass += "bg-white/30 border-white/40 opacity-40";

            return (
              <button key={idx} disabled={selectedOpt !== null} onClick={() => handleAnswer(idx)} className={btnClass}>
                <span>{opt}</span>
                {selectedOpt === null && (
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-slate-300 group-hover:border-purple-400 flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}