import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js'; // 👈 IMPORT TESSERACT
import { 
  RefreshCw, ChevronDown, Lock, Unlock, AlertCircle, Shield, BookOpen, Lightbulb, 
  Key, Hash, Grid, LayoutGrid, Cpu, Camera, Loader // 👈 TAMBAH ICON CAMERA & LOADER
} from 'lucide-react';
import { ciphers } from '../utils/crypto';
import StepVisualizer from '../components/StepVisualizer';

const ALGORITHMS = [
  { id: 'vigenere', name: 'Vigenere Cipher', icon: Key },
  { id: 'affine', name: 'Affine Cipher', icon: Hash },
  { id: 'playfair', name: 'Playfair Cipher', icon: Grid },
  { id: 'hill', name: 'Hill Cipher (Matriks 2x2)', icon: LayoutGrid },
  { id: 'enigma', name: 'Mesin Enigma', icon: Cpu }
];

const ALGO_TIPS = {
  vigenere: { title: "Info Vigenere", desc: "Kata kunci berulang. A=0...Z=25." },
  affine: { title: "Info Affine", desc: "A harus ganjil bukan 13 (Koprima dgn 26)." },
  playfair: { title: "Info Playfair", desc: "Grid 5x5. Huruf J dilebur menjadi I." },
  hill: { title: "Info Hill (2x2)", desc: "Determinan matriks wajib koprima dgn 26." },
  enigma: { title: "Info Enigma", desc: "Input rotasi 3 huruf. Dekripsi identik dengan enkripsi." }
};

const CalculatorTab = React.memo(({ state, setState }) => {
  const { algo, text, output, error, keyStr, keyA, keyB, hillMat, enigmaPos, stepData, showSteps } = state;

  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedOutput, setDisplayedOutput] = useState(output || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 🚀 STATE BARU UNTUK SCAN GAMBAR
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef(null); // Ref untuk memicu input file

  const animatedTextRef = useRef(null);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, [setState]);

  useEffect(() => {
    if (!isProcessing) setDisplayedOutput(output);
  }, [output, isProcessing]);

  // 🚀 FUNGSI BARU: Membaca teks dari gambar dan memasukkannya ke input
  const handleImageScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);
    
    try {
      // Tesseract membaca file (dukung bahasa Inggris & Indonesia)
      const result = await Tesseract.recognize(file, 'eng+ind', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Hapus spasi berlebih atau baris baru yang kosong agar rapi
      const extractedText = result.data.text.trim().replace(/\n+/g, '\n');
      
      // Langsung tembak teks hasil scan ke State Input
      updateState({ text: extractedText });
      
    } catch (err) {
      updateState({ error: "Gagal membaca teks dari gambar. Pastikan gambar jelas." });
    } finally {
      setIsScanning(false);
      // Reset input file agar bisa upload file yang sama lagi jika butuh
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProcess = useCallback((decrypt = false) => {
    if (!text.trim()) return;
    
    updateState({ error: '', output: '', stepData: null, showSteps: false });
    setIsProcessing(true);
    setDisplayedOutput('');
    
    if (animatedTextRef.current) animatedTextRef.current.innerText = '';

    try {
      let processed;
      if (algo === 'vigenere') processed = ciphers.vigenere(text, keyStr, decrypt);
      else if (algo === 'affine') processed = ciphers.affine(text, keyA, keyB, decrypt);
      else if (algo === 'playfair') processed = ciphers.playfair(text, keyStr, decrypt);
      else if (algo === 'hill') processed = ciphers.hill(text, hillMat, decrypt);
      else if (algo === 'enigma') processed = ciphers.enigma(text, enigmaPos, decrypt);
      
      const res = processed.result;
      if (!res) { setIsProcessing(false); return; }

      processed.isDecrypt = decrypt;

      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
      let iterations = 0;
      const maxIterations = 20; 
      
      const interval = setInterval(() => {
        let currentDisplay = res.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < (iterations / maxIterations) * res.length) return res[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        
        if (animatedTextRef.current) {
          animatedTextRef.current.innerText = currentDisplay;
        }

        iterations++;
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setIsProcessing(false);
          setDisplayedOutput(res);
          updateState({ output: res, stepData: processed });
        }
      }, 50);

    } catch (err) {
      setIsProcessing(false);
      updateState({ error: err.message });
    }
  }, [algo, text, keyStr, keyA, keyB, hillMat, enigmaPos, updateState]);

  const activeAlgoInfo = useMemo(() => {
    return ALGORITHMS.find(a => a.id === algo) || ALGORITHMS[0];
  }, [algo]);
  
  const ActiveAlgoIcon = activeAlgoInfo.icon;

  return (
    <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-[2rem] space-y-6">
      {/* HEADER (Sama seperti sebelumnya) */}
      <div className="flex items-center gap-3 border-b border-purple-200/50 pb-4">
        <div className="p-2 md:p-3 bg-purple-100 rounded-xl md:rounded-2xl text-purple-600 shadow-inner">
          <RefreshCw size={20} className={`md:w-[26px] md:h-[26px] ${isProcessing ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Kalkulator Kripto</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Enkripsi dan dekripsi instan</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="flex-[1.618] space-y-5 flex flex-col">
          
          {/* DROPDOWN ALGORITMA (Sama seperti sebelumnya) */}
          <div className="group relative z-20">
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Pilih Algoritma</label>
            <button
              onClick={() => !isProcessing && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isProcessing}
              className={`w-full flex items-center justify-between glass-input p-3 md:p-4 rounded-xl md:rounded-2xl text-slate-800 font-semibold text-sm md:text-base cursor-pointer disabled:opacity-60 transition-all hover:bg-white/40 ${isDropdownOpen ? 'ring-2 ring-purple-400' : ''}`}
            >
              <div className="flex items-center gap-3">
                <ActiveAlgoIcon size={20} className="text-purple-600" />
                <span>{activeAlgoInfo.name}</span>
              </div>
              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={20} className="text-slate-400" />
              </motion.div>
            </button>

            {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />}

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 z-20 bg-white/95 backdrop-blur-xl border border-purple-100 shadow-xl rounded-xl md:rounded-2xl overflow-hidden"
                >
                  {ALGORITHMS.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = algo === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => { updateState({ algo: item.id, showSteps: false }); setIsDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 p-3 md:p-4 text-left transition-colors hover:bg-purple-50 ${isActive ? 'bg-purple-100/50 text-purple-700 font-bold' : 'text-slate-600 font-medium'}`}
                        >
                          <ItemIcon size={18} className={isActive ? 'text-purple-600' : 'text-slate-400'} />
                          <span className="text-sm md:text-base">{item.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* 🚀 AREA TEKS INPUT YANG DIPERBARUI DENGAN SCANNER */}
          <div className="group flex-1 flex flex-col relative z-0">
            <div className="flex justify-between items-end mb-1.5 md:mb-2">
              <label className="block text-xs md:text-sm font-bold text-slate-700">Teks Input</label>
              
              {/* TOMBOL SCAN GAMBAR */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageScan} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isScanning || isProcessing}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isScanning ? (
                  <><Loader size={14} className="animate-spin" /> Sedang Membaca {scanProgress}%</>
                ) : (
                  <><Camera size={14} /> Scan Teks dari Gambar</>
                )}
              </button>
            </div>

            <textarea 
              value={text} 
              onChange={(e) => updateState({ text: e.target.value })} 
              disabled={isProcessing || isScanning}
              placeholder={isScanning ? "Mengekstrak teks dari gambar..." : "Ketik pesan rahasia di sini..."}
              className={`glass-input w-full p-3 md:p-4 rounded-xl md:rounded-2xl flex-1 min-h-[100px] md:min-h-[120px] resize-none font-mono text-sm md:text-base transition-all ${isScanning ? 'opacity-60 bg-slate-50' : ''} disabled:opacity-60`}
            />
          </div>

          {/* KONFIGURASI KUNCI (Sama seperti sebelumnya) */}
          <div className="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-white/80 transition-all hover:shadow-md relative z-0">
            <h3 className="text-xs md:text-sm font-black text-purple-700 uppercase tracking-wider flex items-center gap-2 mb-3 md:mb-4">Konfigurasi Kunci</h3>
            <AnimatePresence mode="popLayout">
              <motion.div key={algo} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                {(algo === 'vigenere' || algo === 'playfair') && (
                  <input type="text" disabled={isProcessing} value={keyStr} onChange={(e) => updateState({ keyStr: e.target.value })} placeholder="Kata Kunci (Huruf)" className="glass-input w-full p-3 md:p-4 rounded-xl font-bold text-slate-700 uppercase tracking-widest text-sm md:text-base disabled:opacity-60" />
                )}
                {algo === 'affine' && (
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase">Multiplier (A)</label>
                      <input type="number" disabled={isProcessing} value={keyA} onChange={(e) => updateState({ keyA: e.target.value })} className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base disabled:opacity-60" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase">Shift (B)</label>
                      <input type="number" disabled={isProcessing} value={keyB} onChange={(e) => updateState({ keyB: e.target.value })} className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base disabled:opacity-60" />
                    </div>
                  </div>
                )}
                {algo === 'hill' && (
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase">Matriks 2x2 (a,b,c,d)</label>
                    <input type="text" disabled={isProcessing} value={hillMat} onChange={(e) => updateState({ hillMat: e.target.value })} placeholder="3,3,2,5" className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base tracking-widest disabled:opacity-60" />
                  </div>
                )}
                {algo === 'enigma' && (
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase text-center">Posisi Awal Rotor</label>
                    <input type="text" disabled={isProcessing} maxLength="3" value={enigmaPos} onChange={(e) => updateState({ enigmaPos: e.target.value.toUpperCase() })} placeholder="AAA" className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-xl md:text-2xl tracking-[1em] text-center pl-4 md:pl-8 disabled:opacity-60" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* TOMBOL ENKRIPSI / DEKRIPSI (Sama seperti sebelumnya) */}
          <div className="flex gap-3 md:gap-4 pt-1 relative z-0">
            <motion.button disabled={isProcessing || isScanning || !text} whileHover={isProcessing || !text ? {} : { scale: 1.02 }} whileTap={isProcessing || !text ? {} : { scale: 0.98 }} onClick={() => handleProcess(false)} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold shadow-lg flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-50">
              <Lock size={16} /> Enkripsi
            </motion.button>
            <motion.button disabled={isProcessing || isScanning || !text} whileHover={isProcessing || !text ? {} : { scale: 1.02 }} whileTap={isProcessing || !text ? {} : { scale: 0.98 }} onClick={() => handleProcess(true)} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold shadow-lg flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-50">
              <Unlock size={16} /> Dekripsi
            </motion.button>
          </div>
        </div>

        {/* OUTPUT AREA (Sama seperti sebelumnya) */}
        <div className="flex-[1] flex flex-col h-full mt-2 lg:mt-0 relative z-0">
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Hasil Pemrosesan</label>
          <div className="flex-1 glass-input bg-white/50 border-2 border-dashed border-purple-300/60 rounded-2xl md:rounded-3xl p-4 md:p-6 relative flex flex-col min-h-[150px] shadow-inner transition-all overflow-hidden">
            {error ? (
              <div className="bg-red-50 text-red-600 font-medium flex items-start gap-2 p-3 rounded-xl border border-red-200 text-xs md:text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center relative">
                {isProcessing && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[2px] animate-[slide-down_1s_ease-in-out_infinite]"></div>}
                
                <p ref={animatedTextRef} className={`font-mono text-lg md:text-2xl tracking-widest break-all text-center font-bold ${isProcessing ? 'text-purple-600 opacity-80' : 'text-slate-800'}`}>
                  {!isProcessing && displayedOutput}
                </p>

                {!isProcessing && !displayedOutput && (
                  <div className="text-slate-400 flex flex-col items-center gap-3 absolute">
                    <Shield size={40} className="opacity-20" />
                    <span className="font-medium text-xs md:text-sm">Hasil akan muncul di sini</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {stepData && !isProcessing && (
            <div className="mt-4">
              <button onClick={() => updateState({ showSteps: !showSteps })} className="w-full py-3 bg-purple-100/80 text-purple-700 font-bold rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors shadow-sm">
                <BookOpen size={16} /> {showSteps ? "Tutup Cara Penyelesaian" : "Lihat Cara Penyelesaian"}
              </button>
              <AnimatePresence>
                {showSteps && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="p-4 mt-3 bg-white/70 rounded-2xl border border-purple-200 shadow-inner overflow-x-auto max-h-[400px] overflow-y-auto">
                      <StepVisualizer data={stepData} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-4 bg-indigo-50/80 border border-indigo-100 p-3 rounded-xl flex items-start gap-3">
            <Lightbulb className="shrink-0 text-amber-500 w-5 h-5" />
            <div>
              <p className="text-[10px] md:text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">{ALGO_TIPS[algo].title}</p>
              <p className="text-xs md:text-sm text-indigo-900/80 leading-snug">{ALGO_TIPS[algo].desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CalculatorTab;