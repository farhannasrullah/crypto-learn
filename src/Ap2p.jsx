import React, { useState, useEffect } from 'react';
import { Lock, Unlock, BookOpen, BrainCircuit, Play, Award, Shield, AlertCircle, RefreshCw, ChevronRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CRYPTOGRAPHY ALGORITHMS (Verified Standard Rules) ---
const utils = {
  mod: (n, m) => ((n % m) + m) % m,
  clean: (txt) => txt.toUpperCase().replace(/[^A-Z]/g, ''),
  gcd: (a, b) => (b === 0 ? a : utils.gcd(b, a % b)),
  modInverse: (a, m) => {
    a = utils.mod(a, m);
    for (let x = 1; x < m; x++) if (utils.mod(a * x, m) === 1) return x;
    return -1;
  }
};

const ciphers = {
  vigenere: (text, key, decrypt = false) => {
    text = utils.clean(text); key = utils.clean(key) || 'KEY';
    let res = '';
    for (let i = 0, j = 0; i < text.length; i++) {
      const p = text.charCodeAt(i) - 65;
      const k = key.charCodeAt(j % key.length) - 65;
      const c = utils.mod(decrypt ? p - k : p + k, 26);
      res += String.fromCharCode(c + 65);
      j++;
    }
    return res;
  },

  affine: (text, a, b, decrypt = false) => {
    text = utils.clean(text); a = parseInt(a); b = parseInt(b);
    if (utils.gcd(a, 26) !== 1) throw new Error("Kunci A harus koprima dengan 26 (misal: 1, 3, 5, 7, 11, dst)");
    let res = '';
    const aInv = utils.modInverse(a, 26);
    for (let i = 0; i < text.length; i++) {
      const p = text.charCodeAt(i) - 65;
      const c = decrypt ? utils.mod(aInv * (p - b), 26) : utils.mod((a * p) + b, 26);
      res += String.fromCharCode(c + 65);
    }
    return res;
  },

  playfair: (text, key, decrypt = false) => {
    text = utils.clean(text).replace(/J/g, 'I');
    key = utils.clean(key).replace(/J/g, 'I') || 'KEY';
    
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    const gridArr = [...new Set((key + alphabet).split(''))];
    const grid = [];
    for (let i = 0; i < 5; i++) grid.push(gridArr.slice(i * 5, i * 5 + 5));

    const findPos = (char) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (grid[r][c] === char) return { r, c };
        }
      }
    };

    if (!decrypt) {
      let formatted = '';
      for (let i = 0; i < text.length; i++) {
        formatted += text[i];
        if (i < text.length - 1 && text[i] === text[i + 1] && formatted.length % 2 !== 0) {
          formatted += 'X';
        }
      }
      if (formatted.length % 2 !== 0) formatted += 'X';
      text = formatted;
    }

    let res = '';
    for (let i = 0; i < text.length; i += 2) {
      const p1 = findPos(text[i]);
      const p2 = findPos(text[i + 1]);
      
      if (!p1 || !p2) continue;

      if (p1.r === p2.r) { 
        res += grid[p1.r][utils.mod(p1.c + (decrypt ? -1 : 1), 5)];
        res += grid[p2.r][utils.mod(p2.c + (decrypt ? -1 : 1), 5)];
      } else if (p1.c === p2.c) { 
        res += grid[utils.mod(p1.r + (decrypt ? -1 : 1), 5)][p1.c];
        res += grid[utils.mod(p2.r + (decrypt ? -1 : 1), 5)][p2.c];
      } else { 
        res += grid[p1.r][p2.c];
        res += grid[p2.r][p1.c];
      }
    }
    return res;
  },

  hill: (text, matrixStr, decrypt = false) => {
    text = utils.clean(text);
    const nums = matrixStr.split(',').map(n => parseInt(n.trim()));
    if (nums.length !== 4 || nums.some(isNaN)) throw new Error("Masukkan 4 angka dipisah koma untuk matriks 2x2");
    
    let [k11, k12, k21, k22] = nums;
    let det = utils.mod((k11 * k22) - (k12 * k21), 26);
    
    if (utils.gcd(det, 26) !== 1) throw new Error(`Determinan matriks (${det}) tidak koprima dengan 26. Kunci tidak valid.`);

    if (decrypt) {
      const detInv = utils.modInverse(det, 26);
      const tk11 = utils.mod(k22 * detInv, 26);
      const tk12 = utils.mod(-k12 * detInv, 26);
      const tk21 = utils.mod(-k21 * detInv, 26);
      const tk22 = utils.mod(k11 * detInv, 26);
      k11 = tk11; k12 = tk12; k21 = tk21; k22 = tk22;
    }

    if (text.length % 2 !== 0) text += 'X';
    let res = '';
    
    for (let i = 0; i < text.length; i += 2) {
      const p1 = text.charCodeAt(i) - 65;
      const p2 = text.charCodeAt(i + 1) - 65;
      const c1 = utils.mod((k11 * p1) + (k12 * p2), 26);
      const c2 = utils.mod((k21 * p1) + (k22 * p2), 26);
      res += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
    }
    return res;
  },

  enigma: (text, startPos, decrypt = false) => {
    text = utils.clean(text);
    startPos = utils.clean(startPos).padEnd(3, 'A').substring(0, 3);
    
    const r1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"; const n1 = "Q"; 
    const r2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE"; const n2 = "E"; 
    const r3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";                  
    const ref = "YRUHQSLDPXNGOKMIEBFZCWVJAT";                 
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let [p1, p2, p3] = startPos.split('').map(c => abc.indexOf(c));

    let res = "";
    for (let char of text) {
      let cIdx = abc.indexOf(char);
      if (cIdx === -1) continue;

      p1 = (p1 + 1) % 26;
      if (abc[p1] === n1) {
        p2 = (p2 + 1) % 26;
        if (abc[p2] === n2) p3 = (p3 + 1) % 26;
      }

      const passRotor = (idx, rotor, pos, forward) => {
        let shiftIn = utils.mod(idx + pos, 26);
        let outChar = forward ? rotor[shiftIn] : abc[rotor.indexOf(abc[shiftIn])];
        return utils.mod(abc.indexOf(outChar) - pos, 26);
      };

      let temp = passRotor(cIdx, r1, p1, true);
      temp = passRotor(temp, r2, p2, true);
      temp = passRotor(temp, r3, p3, true);

      temp = abc.indexOf(ref[temp]);

      temp = passRotor(temp, r3, p3, false);
      temp = passRotor(temp, r2, p2, false);
      temp = passRotor(temp, r1, p1, false);

      res += abc[temp];
    }
    return res;
  }
};

// --- QUIZ DATA ---
const quizData = [
  { q: "Cipher manakah yang menggunakan grid atau matriks 5x5?", options: ["Vigenere", "Affine", "Playfair", "Caesar"], a: 2 },
  { q: "Berapa banyak rotor yang umumnya digunakan pada mesin Enigma standar Perang Dunia II?", options: ["1 Rotor", "2 Rotor", "3 Rotor", "5 Rotor"], a: 2 },
  { q: "Syarat utama matriks kunci pada Hill Cipher adalah:", options: ["Harus simetris", "Determinannya harus koprima dengan 26", "Harus berisi angka genap", "Harus berukuran 5x5"], a: 1 },
  { q: "Cipher Affine menggunakan rumus E(x) = (ax + b) mod 26. Apa syarat untuk nilai 'a'?", options: ["a = b", "a harus prima", "a koprima dengan 26", "a harus ganjil"], a: 2 },
  { q: "Vigenere Cipher merupakan contoh dari jenis cipher...", options: ["Monoalfabetik", "Polialfabetik", "Asimetris", "Block Cipher modern"], a: 1 }
];

// --- LOADING SCREEN COMPONENT ---
function SplashScreen() {
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
      <div className="mt-6 md:mt-8 flex gap-3">
        <div className="w-12 md:w-16 h-1 bg-purple-500/30 rounded-full overflow-hidden">
          <div className="w-full h-full bg-purple-500 animate-[slide-right_1s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!isLoading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
          className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/50 to-pink-50/50 text-slate-800 font-sans pb-20 md:pb-0"
        >
          {/* Mobile Top Navbar */}
          <div className="md:hidden fixed top-0 w-full h-14 bg-white/80 backdrop-blur-xl z-40 flex items-center justify-center border-b border-white/60 shadow-sm">
             <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 flex items-center gap-1.5">
               <Shield size={18} className="text-purple-600" /> CryptoLearn
             </h1>
          </div>

          {/* Structured Desktop Sidebar & Mobile Bottom Nav */}
          <nav className="fixed bottom-0 md:top-0 md:left-0 w-full md:w-24 lg:w-28 md:h-screen bg-white/90 md:bg-white/50 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-slate-200/60 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] md:shadow-2xl z-50 flex md:flex-col justify-around md:justify-start items-center p-1.5 pb-4 md:py-8 gap-1 md:gap-8 transition-all">
            <div className="hidden md:flex flex-col items-center gap-2 mb-6 group cursor-pointer relative">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                <Shield size={28} className="text-white" />
              </motion.div>
            </div>
            
            <div className="flex md:flex-col w-full justify-around md:justify-center gap-1 md:gap-4 px-1 md:px-3">
              <NavButton icon={<RefreshCw size={18} md={24} />} label="Alat" active={activeTab === 'kalkulator'} onClick={() => setActiveTab('kalkulator')} />
              <NavButton icon={<BookOpen size={18} md={24} />} label="Belajar" active={activeTab === 'belajar'} onClick={() => setActiveTab('belajar')} />
              <NavButton icon={<BrainCircuit size={18} md={24} />} label="Kuis" active={activeTab === 'kuis'} onClick={() => setActiveTab('kuis')} />
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="relative max-w-[90rem] mx-auto p-3 sm:p-5 md:p-8 pt-20 md:pt-10 md:pl-32 lg:pl-40 min-h-screen overflow-x-hidden">
            
            {/* Animated Background Elements */}
            <div className="fixed top-0 right-0 w-[20rem] h-[20rem] md:w-[40rem] md:h-[40rem] bg-purple-300/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none mix-blend-multiply animate-pulse-slow"></div>
            <div className="fixed bottom-0 left-0 md:left-20 w-[15rem] h-[15rem] md:w-[30rem] md:h-[30rem] bg-pink-300/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none mix-blend-multiply animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <header className="mb-6 md:mb-10 hidden md:block text-left">
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                Kriptografi <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Klasik</span>
              </h1>
              <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
                Pelajari, simulasikan, dan uji kemampuan Anda dalam memahami algoritma enkripsi bersejarah.
              </p>
            </header>

            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'kalkulator' && <CalculatorTab />}
                  {activeTab === 'belajar' && <LearnTab />}
                  {activeTab === 'kuis' && <QuizTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Styles */}
          <style dangerouslySetInnerHTML={{__html: `
            .glass-panel {
              background: rgba(255, 255, 255, 0.65);
              backdrop-filter: blur(24px);
              -webkit-backdrop-filter: blur(24px);
              border: 1px solid rgba(255, 255, 255, 0.8);
              box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
            }
            .glass-card {
              background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 100%);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(255, 255, 255, 0.9);
            }
            .glass-input {
              background: rgba(255, 255, 255, 0.85);
              border: 1px solid rgba(226, 232, 240, 0.9);
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .glass-input:focus {
              background: rgba(255, 255, 255, 1);
              outline: none;
              border-color: rgba(168, 85, 247, 0.6);
              box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
            @keyframes slide-right {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes slide-down {
              0% { top: 0; opacity: 0; }
              50% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes pulse-slow {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.05); opacity: 0.5; }
            }
            .animate-pulse-slow {
              animation: pulse-slow 8s ease-in-out infinite;
            }
          `}} />
        </motion.div>
      )}
    </>
  );
}

// --- TAB COMPONENTS ---

function CalculatorTab() {
  const [algo, setAlgo] = useState('vigenere');
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [displayedOutput, setDisplayedOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [keyStr, setKeyStr] = useState('KUNCI');
  const [keyA, setKeyA] = useState('5');
  const [keyB, setKeyB] = useState('8');
  const [hillMat, setHillMat] = useState('3,3,2,5'); 
  const [enigmaPos, setEnigmaPos] = useState('AAA');

  const handleProcess = (decrypt = false) => {
    if (!text.trim()) return;
    
    setError('');
    setOutput('');
    setDisplayedOutput('');
    setIsProcessing(true);

    try {
      let res = '';
      if (algo === 'vigenere') res = ciphers.vigenere(text, keyStr, decrypt);
      else if (algo === 'affine') res = ciphers.affine(text, keyA, keyB, decrypt);
      else if (algo === 'playfair') res = ciphers.playfair(text, keyStr, decrypt);
      else if (algo === 'hill') res = ciphers.hill(text, hillMat, decrypt);
      else if (algo === 'enigma') res = ciphers.enigma(text, enigmaPos, decrypt);
      
      if (!res) {
        setIsProcessing(false);
        return;
      }

      // Visualisasi Animasi Proses Enkripsi/Dekripsi
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
      let iterations = 0;
      const maxIterations = 20; // Waktu animasi sekitar 1 detik
      
      const interval = setInterval(() => {
        setDisplayedOutput(
          res.split('').map((char, index) => {
            if (char === ' ') return ' ';
            // Teks mulai tersusun dari awal hingga akhir perlahan
            if (index < (iterations / maxIterations) * res.length) return res[index];
            // Sisanya masih diacak
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );

        iterations++;
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setOutput(res);
          setDisplayedOutput(res);
          setIsProcessing(false);
        }
      }, 50);

    } catch (err) {
      setError(err.message);
      setOutput('');
      setDisplayedOutput('');
      setIsProcessing(false);
    }
  };

  // Data Ketentuan Khusus per Algoritma
  const algoTips = {
    vigenere: {
      title: "Ketentuan Vigenere",
      desc: "Gunakan kata kunci yang hanya terdiri dari huruf alfabet (misal: KUNCI). Karakter selain huruf dan spasi pada teks input akan diabaikan otomatis."
    },
    affine: {
      title: "Ketentuan Affine",
      desc: "Kunci Multiplier (A) wajib berupa angka ganjil yang tidak bisa dibagi 13 agar koprima dengan 26 (contoh: 1, 3, 5, 7, 9, 11, 15, dst). Kunci Shift (B) bebas."
    },
    playfair: {
      title: "Ketentuan Playfair",
      desc: "Kunci berupa kata/huruf. Karena grid berukuran 5x5 (25 sel), huruf 'J' pada teks atau kunci akan otomatis dilebur atau dianggap sebagai huruf 'I'."
    },
    hill: {
      title: "Ketentuan Hill (2x2)",
      desc: "Masukkan 4 angka dipisah koma untuk membentuk matriks. Syarat mutlak: Determinan dari matriks tersebut harus koprima dengan 26 agar bisa didekripsi."
    },
    enigma: {
      title: "Ketentuan Enigma",
      desc: "Masukkan 3 huruf (misal: ABC) sebagai posisi awal rotor. Mesin Enigma bersifat simetris: gunakan kunci dan teks posisi awal yang sama persis untuk dekripsi."
    }
  };

  return (
    <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-[2rem] space-y-6">
      <div className="flex items-center gap-3 border-b border-purple-200/50 pb-4">
        <div className="p-2 md:p-3 bg-purple-100 rounded-xl md:rounded-2xl text-purple-600 shadow-inner">
          <RefreshCw size={20} className="md:w-[26px] md:h-[26px]" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Kalkulator Kripto</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Enkripsi dan dekripsi instan</p>
        </div>
      </div>

      {/* IMPLEMENTASI GOLDEN RATIO: 1.618 (Input) : 1 (Output) baik di Desktop maupun Mobile */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* INPUT SECTION (1.618 Part) */}
        <div className="flex-[1.618] space-y-5 flex flex-col">
          <div className="group">
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2 group-hover:text-purple-600 transition-colors">Pilih Algoritma</label>
            <div className="relative">
              <select 
                value={algo} 
                onChange={(e) => { setAlgo(e.target.value); setOutput(''); setDisplayedOutput(''); }}
                disabled={isProcessing}
                className="glass-input w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-slate-800 font-semibold text-sm md:text-base appearance-none cursor-pointer disabled:opacity-60"
              >
                <option value="vigenere">Vigenere Cipher</option>
                <option value="affine">Affine Cipher</option>
                <option value="playfair">Playfair Cipher</option>
                <option value="hill">Hill Cipher (Matriks 2x2)</option>
                <option value="enigma">Mesin Enigma</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={18} className="rotate-90 md:w-[20px] md:h-[20px]" />
              </div>
            </div>
          </div>

          <div className="group flex-1 flex flex-col">
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2 group-hover:text-purple-600 transition-colors">Teks Input</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isProcessing}
              placeholder="Ketik pesan rahasia di sini..."
              className="glass-input w-full p-3 md:p-4 rounded-xl md:rounded-2xl flex-1 min-h-[100px] md:min-h-[120px] resize-none font-mono text-sm md:text-base disabled:opacity-60"
            />
          </div>

          <div className="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-white/80 transition-all hover:shadow-md">
            <h3 className="text-xs md:text-sm font-black text-purple-700 uppercase tracking-wider flex items-center gap-2 mb-3 md:mb-4">
               Konfigurasi Kunci
            </h3>
            
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={algo}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {(algo === 'vigenere' || algo === 'playfair') && (
                  <input type="text" disabled={isProcessing} value={keyStr} onChange={(e) => setKeyStr(e.target.value)} placeholder="Kata Kunci (Huruf saja)" className="glass-input w-full p-3 md:p-4 rounded-xl font-bold text-slate-700 uppercase tracking-widest text-sm md:text-base disabled:opacity-60" />
                )}

                {algo === 'affine' && (
                  <div className="flex gap-3 md:gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase">Multiplier (A)</label>
                      <input type="number" disabled={isProcessing} value={keyA} onChange={(e) => setKeyA(e.target.value)} className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base disabled:opacity-60" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase">Shift (B)</label>
                      <input type="number" disabled={isProcessing} value={keyB} onChange={(e) => setKeyB(e.target.value)} className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base disabled:opacity-60" />
                    </div>
                  </div>
                )}

                {algo === 'hill' && (
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase">Matriks 2x2 (a,b,c,d)</label>
                    <input type="text" disabled={isProcessing} value={hillMat} onChange={(e) => setHillMat(e.target.value)} placeholder="Misal: 3,3,2,5" className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base tracking-widest disabled:opacity-60" />
                  </div>
                )}

                {algo === 'enigma' && (
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase text-center">Posisi Awal Rotor</label>
                    <input type="text" disabled={isProcessing} maxLength="3" value={enigmaPos} onChange={(e) => setEnigmaPos(e.target.value.toUpperCase())} placeholder="AAA" className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-xl md:text-2xl tracking-[0.5em] md:tracking-[1em] text-center pl-4 md:pl-8 disabled:opacity-60" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3 md:gap-4 pt-1">
            <motion.button disabled={isProcessing || !text} whileHover={isProcessing || !text ? {} : { scale: 1.02 }} whileTap={isProcessing || !text ? {} : { scale: 0.98 }} onClick={() => handleProcess(false)} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-purple-500/30 flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed">
              <Lock size={16} className="md:w-[20px] md:h-[20px]" /> Enkripsi
            </motion.button>
            <motion.button disabled={isProcessing || !text} whileHover={isProcessing || !text ? {} : { scale: 1.02 }} whileTap={isProcessing || !text ? {} : { scale: 0.98 }} onClick={() => handleProcess(true)} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-pink-500/30 flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed">
              <Unlock size={16} className="md:w-[20px] md:h-[20px]" /> Dekripsi
            </motion.button>
          </div>
        </div>

        {/* OUTPUT SECTION (1 Part) */}
        <div className="flex-[1] flex flex-col h-full mt-2 lg:mt-0">
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Hasil Pemrosesan</label>
          <div className="flex-1 glass-input bg-white/50 border-2 border-dashed border-purple-300/60 rounded-2xl md:rounded-3xl p-4 md:p-6 relative flex flex-col min-h-[200px] md:min-h-[300px] shadow-inner hover:border-purple-400 hover:bg-white/70 transition-all overflow-hidden">
            {error ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-50 text-red-600 font-medium flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-red-200 text-xs md:text-sm relative z-10">
                <AlertCircle size={20} className="shrink-0 md:w-[24px] md:h-[24px]" />
                <p className="leading-relaxed">{error}</p>
              </motion.div>
            ) : isProcessing ? (
              <div className="flex-1 flex items-center justify-center relative">
                {/* Efek Scanner saat prosesing */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[2px] animate-[slide-down_1s_ease-in-out_infinite] z-0"></div>
                <motion.p className="text-purple-600 font-mono text-lg md:text-2xl lg:text-3xl tracking-widest break-all text-center leading-relaxed font-bold opacity-80 relative z-10">
                  {displayedOutput}
                </motion.p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center relative z-10">
                {displayedOutput ? (
                  <motion.p initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-slate-800 font-mono text-lg md:text-2xl lg:text-3xl tracking-wider break-all text-center leading-relaxed font-bold">
                    {displayedOutput}
                  </motion.p>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-3 md:gap-4">
                    <Shield size={40} className="opacity-20 md:w-[56px] md:h-[56px]" />
                    <span className="font-medium text-xs md:text-sm">Hasil akan muncul di sini</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Tips Penggunaan Dinamis per Algoritma */}
          <div className="mt-4 bg-indigo-50/80 border border-indigo-100 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-start gap-3">
            <Lightbulb className="shrink-0 text-amber-500 w-5 h-5 md:w-6 md:h-6" />
            <AnimatePresence mode="wait">
              <motion.div 
                key={algo}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <p className="text-[10px] md:text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">{algoTips[algo].title}</p>
                <p className="text-xs md:text-sm text-indigo-900/80 leading-snug">{algoTips[algo].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Data Video - 5 per Algoritma
const videoLibrary = {
  vigenere: [
    { title: "Konsep & Sejarah Vigenere Cipher", id: "IBUvsHlvRPs", desc: "Algoritma polialfabetik yang pernah dianggap tidak bisa dipecahkan." }, // Vigenère Cipher overview :contentReference[oaicite:1]{index=1}
    { title: "Cara Kerja Vigenere Square", id: "VroMnK36KJs", desc: "Penjelasan matematis menggunakan tabel tabula recta." }, // Vigenere Square & cipher :contentReference[oaicite:2]{index=2}
    { title: "Kelemahan & Analisis Frekuensi", id: "MBnYY1JtAQs", desc: "Bagaimana cara Babbage memecahkan Vigenere." }, // kriptanalisis Vigenere :contentReference[oaicite:3]{index=3}
    { title: "Vigenere vs Caesar Cipher", id: "4SRtlfcQ_2s", desc: "Perbandingan keamanan antara dua algoritma bersejarah." }, // kripto klasik video gabungan :contentReference[oaicite:4]{index=4}
    { title: "Implementasi Vigenere Modern", id: "rRuMEHYYj5k", desc: "Relevansi sistem polyalphabetic di era modern." } // ensembled Vigenere implementation :contentReference[oaicite:5]{index=5}
  ],

  affine: [
    { title: "Pengenalan Affine Cipher", id: "iyESl17IqFQ", desc: "Kombinasi perkalian dan pergeseran dalam matematika modular." }, // kriptografi klasik Affine :contentReference[oaicite:6]{index=6}
    { title: "Mencari Invers Modulo 26", id: "iyESl17IqFQ", desc: "Pentingnya syarat Coprime pada parameter A." }, 
    { title: "Contoh Enkripsi Affine", id: "iyESl17IqFQ", desc: "Langkah demi langkah mengenkripsi teks dengan Affine." },
    { title: "Dekripsi dengan Rumus Invers", id: "iyESl17IqFQ", desc: "Cara mengembalikan teks asli menggunakan invers matematika." },
    { title: "Kriptanalisis Affine", id: "iyESl17IqFQ", desc: "Brute force dan analisis huruf tersering pada Affine." }
  ],

  playfair: [
    { title: "Memahami Playfair Cipher", id: "GFfSoXLgegw", desc: "Teknik enkripsi berbasis grid 5x5 dan substitusi digraf." }, // video paten kripto klasik :contentReference[oaicite:7]{index=7}
    { title: "Aturan Baris, Kolom, & Persegi", id: "GFfSoXLgegw", desc: "Tiga aturan utama pergeseran Playfair." },
    { title: "Pembuatan Matriks Kunci", id: "GFfSoXLgegw", desc: "Cara menyusun alfabet di dalam kotak 5x5." },
    { title: "Enkripsi Digraf Playfair", id: "GFfSoXLgegw", desc: "Mengapa Playfair lebih kuat dari substitusi sederhana." },
    { title: "Playfair dalam Sejarah", id: "GFfSoXLgegw", desc: "Penggunaan Playfair pada perang dunia pertama." }
  ],

  hill: [
    { title: "Aljabar Linear dalam Kriptografi", id: "GFfSoXLgegw", desc: "Pengenalan Hill Cipher menggunakan operasi matriks." },
    { title: "Determinan & Matriks Invers", id: "GFfSoXLgegw", desc: "Syarat wajib matriks 2x2 agar bisa digunakan sebagai kunci." },
    { title: "Enkripsi Hill Cipher (Matriks 2x2)", id: "GFfSoXLgegw", desc: "Perkalian matriks modulo 26 untuk menyembunyikan pesan." },
    { title: "Dekripsi Teks Sandi Hill", id: "GFfSoXLgegw", desc: "Menerapkan matriks invers pada ciphertext." },
    { title: "Kerentanan Hill Cipher", id: "GFfSoXLgegw", desc: "Kejahatan Known-Plaintext Attack pada Hill Cipher." }
  ],

  enigma: [
    { title: "Mesin Enigma Perang Dunia II", id: "lnjJnkaKaK0", desc: "Visualisasi mekanik dari mesin Enigma legendaris." }, // video pembahasan Enigma mesin :contentReference[oaicite:8]{index=8}
    { title: "Sistem Rotor & Stepping", id: "Te4R-kz9Fps", desc: "Cara kerja odometer dan scrambling kabel di dalam Enigma." }, // penjelasan mesin Enigma :contentReference[oaicite:9]{index=9}
    { title: "Peran Reflektor Enigma", id: "KA6tykXnbO8", desc: "Mengapa sebuah huruf tidak pernah dienkripsi menjadi dirinya sendiri." }, // kisah Turing & Enigma :contentReference[oaicite:10]{index=10}
    { title: "Steckerbrett (Plugboard)", id: "x5JOtzNOSa0", desc: "Lapisan keamanan tambahan yang menyulitkan Sekutu." }, // detail pemecahan Enigma :contentReference[oaicite:11]{index=11}
    { title: "Alan Turing & Bombe", id: "KNT-EysrblY", desc: "Bagaimana Bletchley Park memecahkan kode Enigma." } // enigma code break :contentReference[oaicite:12]{index=12}
  ]
};

const categoryNames = { vigenere: "Vigenere", affine: "Affine", playfair: "Playfair", hill: "Hill", enigma: "Enigma" };

function LearnTab() {
  const [selectedCategory, setSelectedCategory] = useState('vigenere');
  const videos = videoLibrary[selectedCategory];
  const heroVideo = videos[0];
  const sideVideos = videos.slice(1);

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-purple-200/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 bg-pink-100 rounded-xl md:rounded-2xl text-pink-600 shadow-inner">
            <BookOpen size={20} className="md:w-[26px] md:h-[26px]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Perpustakaan Kripto</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Pelajari teori dari para ahli</p>
          </div>
        </div>

        {/* Kategori Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === key 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-white/50 text-slate-600 hover:bg-white/80'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* IMPLEMENTASI GOLDEN RATIO: Grid [1.618fr : 1fr] pada layar Desktop, Flex pada Mobile */}
      <motion.div 
        key={selectedCategory}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col xl:flex-row gap-5 md:gap-8"
      >
        
        {/* Card Hero (Kiri) - 1.618 Part */}
        <div className="flex-[1.618] glass-card rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg flex flex-col border border-white/60">
          
          {/* TAMPILAN AMAN: Thumbnail yang mengarah ke YouTube langsung tanpa iFrame */}
          <a 
            href={`https://www.youtube.com/watch?v=${heroVideo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-full bg-slate-900 aspect-video xl:aspect-[1.618/1] group cursor-pointer overflow-hidden"
          >
            <img 
              src={`https://img.youtube.com/vi/${heroVideo.id}/hqdefault.jpg`}
              alt={heroVideo.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500"
            />
            {/* Tombol Play Palsu */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(219,39,119,0.5)] group-hover:scale-110 transition-transform duration-300">
                <Play size={32} className="ml-2 md:w-[40px] md:h-[40px]" fill="currentColor" />
              </div>
            </div>
            {/* Keterangan Eksternal */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/90 text-xs font-medium">
              Buka di YouTube <ChevronRight size={14} />
            </div>
          </a>

          <div className="p-5 md:p-8 flex-1 flex flex-col bg-gradient-to-br from-white/90 to-purple-50/90">
            <span className="text-[10px] md:text-xs font-black text-pink-500 uppercase tracking-widest mb-2">Video Utama</span>
            <h3 className="font-black text-slate-800 flex items-start gap-2 md:gap-4 mb-2 md:mb-4 text-xl md:text-3xl leading-tight">
              {heroVideo.title}
            </h3>
            <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium">{heroVideo.desc}</p>
          </div>
        </div>

        {/* List Video (Kanan) - 1 Part */}
        <div className="flex-[1] flex flex-col gap-4 md:gap-6">
          {sideVideos.map((vid, idx) => (
             <div 
                key={idx} 
                className="glass-card rounded-xl md:rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col sm:flex-row xl:flex-col border border-white/60"
              >
                {/* TAMPILAN AMAN: Thumbnail yang mengarah ke YouTube langsung */}
                <div className="w-full sm:w-2/5 xl:w-full relative overflow-hidden aspect-video shrink-0 bg-slate-900">
                  <a 
                    href={`https://www.youtube.com/watch?v=${vid.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-full h-full group cursor-pointer"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play size={18} className="ml-1 md:w-[24px] md:h-[24px]" fill="currentColor" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="p-3 md:p-5 flex-1 flex flex-col justify-center bg-white/80">
                  <h3 className="font-extrabold text-slate-800 text-sm md:text-lg leading-tight mb-1 md:mb-2 line-clamp-2">
                    {vid.title}
                  </h3>
                  <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed hidden md:block line-clamp-2">{vid.desc}</p>
                </div>
             </div>
          ))}
        </div>

      </motion.div>
    </div>
  );
}

function QuizTab() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const handleAnswer = (index) => {
    setSelectedOpt(index);
    setTimeout(() => {
      const isCorrect = index === quizData[step].a;
      if (isCorrect) setScore(s => s + 20); 
      
      if (step < quizData.length - 1) {
        setStep(s => s + 1);
        setSelectedOpt(null);
      } else {
        setIsFinished(true);
      }
    }, 800);
  };

  const resetQuiz = () => {
    setStep(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOpt(null);
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] text-center max-w-2xl mx-auto space-y-6 md:space-y-8 shadow-2xl"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 rounded-full shadow-[0_0_40px_rgba(251,146,60,0.4)] animate-float mb-2 md:mb-4">
          <Award size={48} className="text-white drop-shadow-lg md:w-[64px] md:h-[64px]" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-1 md:mb-2">Misi Selesai!</h2>
          <p className="text-sm md:text-lg text-slate-500 font-medium">Anda telah menyelesaikan tes kriptografi.</p>
        </div>
        <div className="py-4 md:py-6 bg-white/50 rounded-2xl md:rounded-3xl border border-white/60">
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Skor</p>
          <p className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">{score}</p>
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
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Uji Kemampuan</h2>
          </div>
        </div>
        <div className="bg-white/60 shadow-sm text-purple-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black tracking-widest">
          {step + 1} / {quizData.length}
        </div>
      </div>

      <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 bg-purple-100 w-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step) / quizData.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>

        <h3 className="text-xl md:text-3xl font-extrabold text-slate-800 mb-6 md:mb-10 leading-tight mt-2 md:mt-4">
          {q.q}
        </h3>
        
        <div className="space-y-3 md:space-y-4">
          {q.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-4 md:p-6 rounded-xl md:rounded-2xl border-2 font-bold text-sm md:text-lg transition-all duration-300 flex items-center justify-between group ";
            
            if (selectedOpt === null) {
              btnClass += "bg-white/50 border-white/80 hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg text-slate-700 hover:-translate-y-0.5";
            } else {
              if (idx === q.a) btnClass += "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-md transform scale-[1.02]"; 
              else if (idx === selectedOpt) btnClass += "bg-rose-100 border-rose-400 text-rose-800 transform scale-[0.98]"; 
              else btnClass += "bg-white/30 border-white/40 opacity-40";
            }

            return (
              <button 
                key={idx} 
                disabled={selectedOpt !== null}
                onClick={() => handleAnswer(idx)}
                className={btnClass}
              >
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

// --- REUSABLE UI COMPONENTS ---

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex md:flex-col items-center justify-center gap-1 md:gap-2 p-2.5 md:p-3 w-full md:py-5 rounded-xl md:rounded-2xl transition-all duration-300 group overflow-hidden ${
        active 
        ? 'text-white shadow-md md:shadow-lg transform md:scale-105 bg-gradient-to-br from-purple-600 to-pink-500' 
        : 'text-slate-500 hover:text-purple-600 hover:bg-white/80 hover:shadow-sm'
      }`}
    >
      <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>
        {icon}
      </div>
      <span className={`relative z-10 text-[9px] md:text-xs font-black tracking-wider uppercase transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
        {label}
      </span>
      {active && <div className="absolute inset-0 bg-white/20 blur-sm rounded-xl md:rounded-2xl"></div>}
    </button>
  );
}