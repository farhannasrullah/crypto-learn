import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

export default function SplashScreen() {
  const [decryptText, setDecryptText] = useState("C R Y P T O");
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let iterations = 0;
    const interval = setInterval(() => {
      setDecryptText(prev => prev.split('').map((char, index) => {
        if(char === ' ') return ' ';
        if(index < iterations / 3) return "CRYPTOLEARN"[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      iterations++;
      if(iterations >= 33) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[100]"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500 blur-[50px] opacity-40 animate-pulse rounded-full"></div>
        <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.5)] relative z-10 animate-float border-2 border-purple-300/50">
          <Shield size={48} className="text-white md:w-[56px] md:h-[56px]" />
          <Lock size={20} className="text-white absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-pink-500 rounded-full p-1 border-2 border-slate-900 md:w-[24px] md:h-[24px]" />
        </div>
      </div>
      <h1 className="mt-8 md:mt-10 text-3xl md:text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 tracking-[0.2em] animate-in fade-in duration-500">
        {decryptText}
      </h1>
    </motion.div>
  );
}