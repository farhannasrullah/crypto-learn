import React, { useState, useEffect } from 'react';
import { Lock, Unlock, BookOpen, BrainCircuit, Play, Award, Shield, AlertCircle, RefreshCw, ChevronRight, Lightbulb, FileText, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CRYPTOGRAPHY ALGORITHMS (Verified Standard Rules + Step Tracking) ---
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
    let result = '';
    let steps = [];
    for (let i = 0, j = 0; i < text.length; i++) {
      const p = text.charCodeAt(i) - 65;
      const k = key.charCodeAt(j % key.length) - 65;
      const c = utils.mod(decrypt ? p - k : p + k, 26);
      const cChar = String.fromCharCode(c + 65);
      result += cChar;
      
      const calc = decrypt ? `(${p} - ${k}) mod 26 = ${c}` : `(${p} + ${k}) mod 26 = ${c}`;
      steps.push({ pChar: text[i], kChar: key[j % key.length], cChar, calc });
      j++;
    }
    return { result, steps, type: 'vigenere' };
  },

  affine: (text, a, b, decrypt = false) => {
    text = utils.clean(text); a = parseInt(a); b = parseInt(b);
    if (utils.gcd(a, 26) !== 1) throw new Error("Kunci A harus koprima dengan 26 (misal: 1, 3, 5, 7, 11, dst)");
    let result = '';
    let steps = [];
    const aInv = utils.modInverse(a, 26);
    
    for (let i = 0; i < text.length; i++) {
      const p = text.charCodeAt(i) - 65;
      const c = decrypt ? utils.mod(aInv * (p - b), 26) : utils.mod((a * p) + b, 26);
      const cChar = String.fromCharCode(c + 65);
      result += cChar;

      const calc = decrypt 
        ? `${aInv} × (${p} - ${b}) mod 26 = ${c}` 
        : `(${a} × ${p} + ${b}) mod 26 = ${c}`;
      steps.push({ pChar: text[i], cChar, calc });
    }
    return { result, steps, type: 'affine', a, b, aInv };
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

    let result = '';
    let steps = [];
    
    for (let i = 0; i < text.length; i += 2) {
      const p1 = findPos(text[i]);
      const p2 = findPos(text[i + 1]);
      if (!p1 || !p2) continue;

      let c1Char, c2Char, rule;

      if (p1.r === p2.r) { 
        c1Char = grid[p1.r][utils.mod(p1.c + (decrypt ? -1 : 1), 5)];
        c2Char = grid[p2.r][utils.mod(p2.c + (decrypt ? -1 : 1), 5)];
        rule = "Baris Sama (Shift Horizontal)";
      } else if (p1.c === p2.c) { 
        c1Char = grid[utils.mod(p1.r + (decrypt ? -1 : 1), 5)][p1.c];
        c2Char = grid[utils.mod(p2.r + (decrypt ? -1 : 1), 5)][p2.c];
        rule = "Kolom Sama (Shift Vertikal)";
      } else { 
        c1Char = grid[p1.r][p2.c];
        c2Char = grid[p2.r][p1.c];
        rule = "Persegi Panjang (Tukar Sudut)";
      }
      
      result += c1Char + c2Char;
      steps.push({ p1: text[i], p2: text[i + 1], c1: c1Char, c2: c2Char, rule });
    }
    return { result, steps, grid, type: 'playfair' };
  },

  hill: (text, matrixStr, decrypt = false) => {
    text = utils.clean(text);
    const nums = matrixStr.split(',').map(n => parseInt(n.trim()));
    if (nums.length !== 4 || nums.some(isNaN)) throw new Error("Masukkan 4 angka dipisah koma untuk matriks 2x2");
    
    let [k11, k12, k21, k22] = nums;
    let det = utils.mod((k11 * k22) - (k12 * k21), 26);
    
    if (utils.gcd(det, 26) !== 1) throw new Error(`Determinan matriks (${det}) tidak koprima dengan 26.`);

    if (decrypt) {
      const detInv = utils.modInverse(det, 26);
      const tk11 = utils.mod(k22 * detInv, 26);
      const tk12 = utils.mod(-k12 * detInv, 26);
      const tk21 = utils.mod(-k21 * detInv, 26);
      const tk22 = utils.mod(k11 * detInv, 26);
      k11 = tk11; k12 = tk12; k21 = tk21; k22 = tk22;
    }

    if (text.length % 2 !== 0) text += 'X';
    let result = '';
    let steps = [];
    
    for (let i = 0; i < text.length; i += 2) {
      const p1 = text.charCodeAt(i) - 65;
      const p2 = text.charCodeAt(i + 1) - 65;
      const c1 = utils.mod((k11 * p1) + (k12 * p2), 26);
      const c2 = utils.mod((k21 * p1) + (k22 * p2), 26);
      
      const char1 = String.fromCharCode(c1 + 65);
      const char2 = String.fromCharCode(c2 + 65);
      result += char1 + char2;

      steps.push({
        pChars: [text[i], text[i+1]],
        pVals: [p1, p2],
        cVals: [c1, c2],
        cChars: [char1, char2],
        calc1: `(${k11}×${p1} + ${k12}×${p2}) mod 26 = ${c1}`,
        calc2: `(${k21}×${p1} + ${k22}×${p2}) mod 26 = ${c2}`
      });
    }
    return { result, steps, matrix: [k11, k12, k21, k22], type: 'hill' };
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

    let result = "";
    let steps = [];
    
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

      const outChar = abc[temp];
      result += outChar;
      
      steps.push({ inChar: char, outChar: outChar, pos: `${abc[p1]}${abc[p2]}${abc[p3]}` });
    }
    return { result, steps, type: 'enigma' };
  }
};

// --- QUIZ DATA ---
const quizData = [
  { q: "Cipher manakah yang menggunakan grid atau matriks 5x5?", options: ["Vigenere", "Affine", "Playfair", "Caesar"], a: 2 },
  { q: "Berapa banyak rotor yang umumnya digunakan pada mesin Enigma standar Perang Dunia II awal?", options: ["1 Rotor", "2 Rotor", "3 Rotor", "5 Rotor"], a: 2 },
  { q: "Syarat utama matriks kunci pada Hill Cipher adalah:", options: ["Harus simetris", "Determinannya harus koprima dengan 26", "Harus berisi angka genap", "Harus berukuran 5x5"], a: 1 },
  { q: "Cipher Affine menggunakan rumus E(x) = (ax + b) mod 26. Apa syarat untuk nilai 'a'?", options: ["a = b", "a harus prima", "a koprima dengan 26", "a harus ganjil"], a: 2 },
  { q: "Vigenere Cipher merupakan contoh dari jenis cipher...", options: ["Monoalfabetik", "Polialfabetik", "Asimetris", "Block Cipher modern"], a: 1 },
  { q: "Dalam Playfair Cipher, huruf 'J' biasanya dilebur atau disamakan dengan huruf...", options: ["H", "K", "I", "Y"], a: 2 },
  { q: "Algoritma substitusi digraf pertama yang sangat praktis digunakan dalam sejarah adalah...", options: ["Hill Cipher", "Vigenere", "Playfair", "Enigma"], a: 2 },
  { q: "Komponen mesin Enigma yang memantulkan arus listrik agar huruf tidak pernah dienkripsi menjadi dirinya sendiri adalah...", options: ["Steckerbrett (Plugboard)", "Rotor", "Stator", "Reflektor"], a: 3 },
  { q: "Jika kunci Multiplier (A) = 1 pada Affine Cipher, maka algoritma tersebut secara matematis akan identik dengan...", options: ["Caesar Cipher", "Vigenere Cipher", "Playfair Cipher", "Hill Cipher"], a: 0 },
  { q: "Tokoh yang dikenal pertama kali berhasil memecahkan kelemahan Vigenere Cipher menggunakan teknik analisis frekuensi adalah...", options: ["Alan Turing", "Charles Babbage", "Lester S. Hill", "Blaise de Vigenere"], a: 1 },
  { q: "Sandi klasik yang diciptakan untuk memanfaatkan konsep aljabar linear dan perkalian matriks adalah...", options: ["Affine Cipher", "Playfair Cipher", "Hill Cipher", "Vigenere Cipher"], a: 2 },
  { q: "Pada Vigenere Cipher, jika teks pesan lebih panjang dari kata kunci, maka yang akan dilakukan pada kata kunci tersebut adalah...", options: ["Dipotong sebagian", "Diulang terus menerus", "Ditambah huruf X di akhir", "Diacak posisinya"], a: 1 },
  { q: "Mesin 'Bombe' diciptakan oleh tim Alan Turing di fasilitas rahasia Bletchley Park secara khusus untuk memecahkan sandi...", options: ["Lorenz", "Typex", "Sigaba", "Enigma"], a: 3 },
  { q: "Berikut ini adalah nilai Multiplier (A) yang VALID dan dapat digunakan pada Affine Cipher (Koprima dengan 26), KECUALI...", options: ["3", "7", "13", "15"], a: 2 },
  { q: "Pada Playfair Cipher, jika dua huruf berada di baris dan kolom yang BERBEDA, maka aturan yang digunakan untuk menggesernya adalah...", options: ["Geser 1 kotak ke kanan", "Geser 1 kotak ke bawah", "Ambil sudut persegi panjang yang berlawanan", "Biarkan tetap sama"], a: 2 }
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
    </motion.div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('kalkulator');
  const [isLoading, setIsLoading] = useState(true);

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
                Crypto <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Learn</span>
              </h1>
              <p className="text-slate-500 mt-2 text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
                Pelajari, simulasikan, dan uji kemampuan Anda dalam memahami algoritma enkripsi bersejarah.
              </p>
            </header>

            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
                  {activeTab === 'kalkulator' && <CalculatorTab />}
                  {activeTab === 'teori' && <TheoryTab />}
                  {activeTab === 'belajar' && <LearnTab />}
                  {activeTab === 'kuis' && <QuizTab />}
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

// --- THEORY TAB ---
function TheoryTab() {
  const [selectedAlgo, setSelectedAlgo] = useState('vigenere');

  const theories = {
    vigenere: {
      title: "Vigenere Cipher",
      subtitle: "Substitusi Polialfabetik Klasik",
      desc: "Algoritma ini menggunakan sederetan sandi Caesar berdasarkan huruf-huruf pada kata kunci. Ini adalah contoh sederhana dari substitusi polialfabetik (satu karakter plaintext bisa menjadi berbagai macam ciphertext tergantung posisinya terhadap kunci).",
      formulaEn: "C_i = (P_i + K_i) \\mod 26",
      formulaDe: "P_i = (C_i - K_i + 26) \\mod 26",
      rules: [
        "Huruf diubah menjadi angka: A=0, B=1, ... Z=25.",
        "Kata kunci diulang terus-menerus hingga panjangnya sama dengan teks asli.",
        "Proses dilakukan huruf demi huruf (i adalah indeks huruf)."
      ]
    },
    affine: {
      title: "Affine Cipher",
      subtitle: "Kombinasi Perkalian & Pergeseran",
      desc: "Affine cipher adalah jenis substitusi monoalfabetik yang setiap hurufnya dipetakan ke ekuivalen numeriknya, dienkripsi menggunakan fungsi matematika linear sederhana, dan kemudian diubah kembali menjadi huruf.",
      formulaEn: "C = (A \\times P + B) \\mod 26",
      formulaDe: "P = A^{-1} \\times (C - B) \\mod 26",
      rules: [
        "Kunci A (Multiplier) wajib memiliki nilai yang koprima dengan 26 (FPB(A, 26) = 1). Contoh yang valid: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25.",
        "Kunci B (Shift) bebas dari 0 hingga 25.",
        "A⁻¹ adalah Invers Modulo dari A terhadap 26."
      ]
    },
    playfair: {
      title: "Playfair Cipher",
      subtitle: "Enkripsi Digraf Berbasis Grid",
      desc: "Playfair merupakan sandi substitusi digraf pertama yang praktis. Alih-alih mengenkripsi satu huruf tunggal, Playfair mengenkripsi pasangan huruf (digraf) sekaligus menggunakan tabel/grid 5x5.",
      formulaEn: "Tiga Aturan Pergeseran Matriks 5x5",
      formulaDe: "Kebalikan dari Tiga Aturan Matriks",
      rules: [
        "Huruf 'J' dilebur menjadi 'I' agar alfabet muat dalam grid 25 kotak.",
        "Jika digraf berada di baris yang sama, geser ke kanan 1 kotak.",
        "Jika digraf berada di kolom yang sama, geser ke bawah 1 kotak.",
        "Jika berbeda baris dan kolom, bentuk persegi panjang dan ambil huruf pada sudut horizontal yang berlawanan."
      ]
    },
    hill: {
      title: "Hill Cipher",
      subtitle: "Kriptografi Aljabar Linear",
      desc: "Diciptakan oleh Lester S. Hill, algoritma ini memanfaatkan konsep aljabar linear, khususnya perkalian matriks. Ini membuatnya sangat sulit dipecahkan dengan analisis frekuensi biasa karena menyembunyikan karakteristik huruf tunggal.",
      formulaEn: "\\mathbf{C} = (\\mathbf{K} \\cdot \\mathbf{P}) \\mod 26",
      formulaDe: "\\mathbf{P} = (\\mathbf{K}^{-1} \\cdot \\mathbf{C}) \\mod 26",
      rules: [
        "Pesan dibagi menjadi vektor blok berukuran n (misal 2x1 untuk matriks 2x2).",
        "Matriks Kunci (K) harus berupa matriks persegi.",
        "Syarat mutlak: Determinan Matriks Kunci harus koprima terhadap 26 agar matriks invers (K⁻¹) dapat ditemukan."
      ]
    },
    enigma: {
      title: "Mesin Enigma",
      subtitle: "Elektromekanis Perang Dunia II",
      desc: "Enigma menggunakan sistem rotor elektromekanis yang berputar setiap kali tuts ditekan (odometer stepping). Hal ini membuat fungsi enkripsinya berubah secara dinamis untuk setiap huruf, menciptakan jutaan kombinasi polialfabetik yang sangat kompleks.",
      formulaEn: "C = E_{reflektor}(E_{rotor3}(E_{rotor2}(E_{rotor1}(P))))",
      formulaDe: "Sama persis (Enigma bersifat Simetris)",
      rules: [
        "Mesin bersifat resiprokal: Jika A menjadi X, maka X pasti menjadi A dengan pengaturan yang sama.",
        "Rotor bergeser satu langkah setiap penekanan tombol. Rotor kedua bergerak jika rotor pertama mencapai titik 'notch' (takik).",
        "Arus listrik melewati ketiga rotor, dipantulkan oleh Reflektor, dan melewati ketiga rotor lagi dalam arah terbalik."
      ]
    }
  };

  const sel = theories[selectedAlgo];

  return (
    <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-[2rem] space-y-6">
      <div className="flex items-center gap-3 border-b border-purple-200/50 pb-4">
        <div className="p-2 md:p-3 bg-blue-100 rounded-xl md:rounded-2xl text-blue-600 shadow-inner">
          <FileText size={20} className="md:w-[26px] md:h-[26px]" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Pusat Teori</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Pelajari matematika di balik layar</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Selector Panel */}
        <div className="lg:w-1/4 flex flex-row lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
          {Object.keys(theories).map(key => (
            <button
              key={key}
              onClick={() => setSelectedAlgo(key)}
              className={`p-3 md:p-4 rounded-xl md:rounded-2xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal ${
                selectedAlgo === key 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform lg:translate-x-2' 
                : 'bg-white/50 text-slate-600 hover:bg-white/80 hover:shadow-sm'
              }`}
            >
              {theories[key].title}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedAlgo}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="lg:w-3/4 space-y-6"
          >
            <div className="bg-white/60 p-6 md:p-8 rounded-3xl border border-white shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-slate-200/50">
                <Hash size={150} />
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-slate-800 mb-1 relative z-10">{sel.title}</h3>
              <p className="text-purple-600 font-bold uppercase tracking-widest text-xs md:text-sm mb-6 relative z-10">{sel.subtitle}</p>
              
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 relative z-10">
                {sel.desc}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-indigo-50/80 p-4 md:p-5 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-widest">Rumus Enkripsi</span>
                  <p className="text-base md:text-lg font-mono text-indigo-900 mt-2 font-bold">{sel.formulaEn}</p>
                </div>
                <div className="bg-pink-50/80 p-4 md:p-5 rounded-2xl border border-pink-100">
                  <span className="text-[10px] md:text-xs font-bold text-pink-400 uppercase tracking-widest">Rumus Dekripsi</span>
                  <p className="text-base md:text-lg font-mono text-pink-900 mt-2 font-bold">{sel.formulaDe}</p>
                </div>
              </div>

              <div className="relative z-10">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-500" /> Aturan Utama
                </h4>
                <ul className="space-y-2">
                  {sel.rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-3 text-sm md:text-base text-slate-600 leading-relaxed">
                      <span className="text-purple-500 font-bold">•</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- CALCULATOR TAB ---
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

  const [stepData, setStepData] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  const handleProcess = (decrypt = false) => {
    if (!text.trim()) return;
    
    setError(''); setOutput(''); setDisplayedOutput('');
    setIsProcessing(true); setStepData(null); setShowSteps(false);

    try {
      let processed;
      if (algo === 'vigenere') processed = ciphers.vigenere(text, keyStr, decrypt);
      else if (algo === 'affine') processed = ciphers.affine(text, keyA, keyB, decrypt);
      else if (algo === 'playfair') processed = ciphers.playfair(text, keyStr, decrypt);
      else if (algo === 'hill') processed = ciphers.hill(text, hillMat, decrypt);
      else if (algo === 'enigma') processed = ciphers.enigma(text, enigmaPos, decrypt);
      
      const res = processed.result;
      if (!res) { setIsProcessing(false); return; }

      // Save processed data for Step Visualization
      processed.isDecrypt = decrypt;

      // Animate Typing
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
      let iterations = 0;
      const maxIterations = 20; 
      
      const interval = setInterval(() => {
        setDisplayedOutput(
          res.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < (iterations / maxIterations) * res.length) return res[index];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('')
        );

        iterations++;
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setOutput(res);
          setDisplayedOutput(res);
          setStepData(processed); // Trigger Visualization display
          setIsProcessing(false);
        }
      }, 50);

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const algoTips = {
    vigenere: { title: "Info Vigenere", desc: "Kata kunci berulang. A=0...Z=25." },
    affine: { title: "Info Affine", desc: "A harus ganjil bukan 13 (Koprima dgn 26)." },
    playfair: { title: "Info Playfair", desc: "Grid 5x5. Huruf J dilebur menjadi I." },
    hill: { title: "Info Hill (2x2)", desc: "Determinan matriks wajib koprima dgn 26." },
    enigma: { title: "Info Enigma", desc: "Input rotasi 3 huruf. Dekripsi identik dengan enkripsi." }
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

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* INPUT SECTION (1.618 Part) */}
        <div className="flex-[1.618] space-y-5 flex flex-col">
          <div className="group">
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Pilih Algoritma</label>
            <div className="relative">
              <select 
                value={algo} 
                onChange={(e) => { setAlgo(e.target.value); setOutput(''); setDisplayedOutput(''); setShowSteps(false); }}
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
            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Teks Input</label>
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
              <motion.div key={algo} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                {(algo === 'vigenere' || algo === 'playfair') && (
                  <input type="text" disabled={isProcessing} value={keyStr} onChange={(e) => setKeyStr(e.target.value)} placeholder="Kata Kunci (Huruf)" className="glass-input w-full p-3 md:p-4 rounded-xl font-bold text-slate-700 uppercase tracking-widest text-sm md:text-base disabled:opacity-60" />
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
                    <input type="text" disabled={isProcessing} value={hillMat} onChange={(e) => setHillMat(e.target.value)} placeholder="3,3,2,5" className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-center text-sm md:text-base tracking-widest disabled:opacity-60" />
                  </div>
                )}
                {algo === 'enigma' && (
                  <div>
                    <label className="text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 block uppercase text-center">Posisi Awal Rotor</label>
                    <input type="text" disabled={isProcessing} maxLength="3" value={enigmaPos} onChange={(e) => setEnigmaPos(e.target.value.toUpperCase())} placeholder="AAA" className="glass-input w-full p-3 md:p-4 rounded-xl font-mono text-xl md:text-2xl tracking-[1em] text-center pl-4 md:pl-8 disabled:opacity-60" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3 md:gap-4 pt-1">
            <motion.button disabled={isProcessing || !text} whileHover={isProcessing || !text ? {} : { scale: 1.02 }} whileTap={isProcessing || !text ? {} : { scale: 0.98 }} onClick={() => handleProcess(false)} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold shadow-lg flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-50">
              <Lock size={16} /> Enkripsi
            </motion.button>
            <motion.button disabled={isProcessing || !text} whileHover={isProcessing || !text ? {} : { scale: 1.02 }} whileTap={isProcessing || !text ? {} : { scale: 0.98 }} onClick={() => handleProcess(true)} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold shadow-lg flex justify-center items-center gap-2 text-sm md:text-base disabled:opacity-50">
              <Unlock size={16} /> Dekripsi
            </motion.button>
          </div>
        </div>

        {/* OUTPUT SECTION (1 Part) */}
        <div className="flex-[1] flex flex-col h-full mt-2 lg:mt-0">
          <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 md:mb-2">Hasil Pemrosesan</label>
          <div className="flex-1 glass-input bg-white/50 border-2 border-dashed border-purple-300/60 rounded-2xl md:rounded-3xl p-4 md:p-6 relative flex flex-col min-h-[150px] shadow-inner transition-all overflow-hidden">
            {error ? (
              <div className="bg-red-50 text-red-600 font-medium flex items-start gap-2 p-3 rounded-xl border border-red-200 text-xs md:text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            ) : isProcessing ? (
              <div className="flex-1 flex items-center justify-center relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-[2px] animate-[slide-down_1s_ease-in-out_infinite]"></div>
                <p className="text-purple-600 font-mono text-lg md:text-2xl tracking-widest break-all text-center font-bold opacity-80">{displayedOutput}</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {displayedOutput ? (
                  <p className="text-slate-800 font-mono text-lg md:text-2xl tracking-wider break-all text-center font-bold">{displayedOutput}</p>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-3">
                    <Shield size={40} className="opacity-20" />
                    <span className="font-medium text-xs md:text-sm">Hasil akan muncul di sini</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* STEP VISUALIZATION BUTTON */}
          {stepData && !isProcessing && (
            <div className="mt-4">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full py-3 bg-purple-100/80 text-purple-700 font-bold rounded-2xl text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors shadow-sm"
              >
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
              <p className="text-[10px] md:text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">{algoTips[algo].title}</p>
              <p className="text-xs md:text-sm text-indigo-900/80 leading-snug">{algoTips[algo].desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- DYNAMIC STEP VISUALIZER COMPONENT ---
function StepVisualizer({ data }) {
  if (!data) return null;

  if (data.type === 'vigenere') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 text-center uppercase">Proses {data.isDecrypt ? "Dekripsi" : "Enkripsi"} Vigenere</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm font-mono items-center">
          {data.steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-bold">{s.pChar} <span className="text-[10px] mx-1">dgn kunci</span> {s.kChar}</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">→</span>
                <span className="bg-purple-100 px-2 py-1 rounded text-purple-700 text-xs whitespace-nowrap">{s.calc}</span>
                <span className="text-slate-400">→</span>
                <span className="bg-pink-100 px-3 py-1 rounded-lg font-black text-pink-700">{s.cChar}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'affine') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 text-center uppercase">Proses {data.isDecrypt ? "Dekripsi" : "Enkripsi"} Affine</p>
        <p className="text-center text-xs bg-slate-100 rounded-lg p-2 font-mono">A = {data.a}, B = {data.b} {data.isDecrypt && `, A⁻¹ = ${data.aInv}`}</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm font-mono items-center mt-4">
          {data.steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-bold text-center w-8">{s.pChar}</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">→</span>
                <span className="bg-purple-100 px-2 py-1 rounded text-purple-700 text-xs whitespace-nowrap">{s.calc}</span>
                <span className="text-slate-400">→</span>
                <span className="bg-pink-100 px-3 py-1 rounded-lg font-black text-pink-700 w-8 text-center">{s.cChar}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'playfair') {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Matriks Kunci 5x5</p>
          <div className="inline-grid grid-cols-5 gap-1 bg-slate-200 p-1 rounded-lg font-mono text-sm md:text-base font-bold shadow-sm">
             {data.grid.map((row, r) => row.map((char, c) => (
               <div key={`${r}-${c}`} className="w-8 h-8 md:w-10 md:h-10 bg-white flex items-center justify-center rounded-md text-purple-700">{char}</div>
             )))}
          </div>
        </div>
        <div className="space-y-2">
          {data.steps.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center gap-2 text-sm font-mono bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="bg-slate-100 px-3 py-1 rounded-lg font-bold tracking-widest">{s.p1}{s.p2}</div>
              <span className="text-slate-400 hidden sm:block">→</span>
              <div className="bg-pink-50 px-3 py-1 rounded-lg font-black text-pink-600 tracking-widest">{s.c1}{s.c2}</div>
              <span className="text-[10px] text-slate-400 font-sans ml-auto uppercase bg-slate-50 px-2 py-1 rounded">{s.rule}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'hill') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Matriks Kunci {data.isDecrypt ? "(Invers)" : ""}</p>
          <div className="inline-block border-l-[3px] border-r-[3px] border-slate-700 px-3 py-1 grid grid-cols-2 gap-x-6 gap-y-1 text-base font-mono bg-purple-50/50 rounded-sm">
            <span>{data.matrix[0]}</span><span>{data.matrix[1]}</span>
            <span>{data.matrix[2]}</span><span>{data.matrix[3]}</span>
          </div>
        </div>
        <div className="space-y-4">
          {data.steps.map((pair, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 border-t border-slate-100 pt-4">
              <div className="flex justify-center items-center gap-3 font-mono text-sm">
                <div className="border-l-[2px] border-r-[2px] border-slate-700 px-2 grid grid-cols-2 gap-x-3 gap-y-1 text-center bg-purple-50/50">
                  <span>{data.matrix[0]}</span><span>{data.matrix[1]}</span>
                  <span>{data.matrix[2]}</span><span>{data.matrix[3]}</span>
                </div>
                <span className="text-slate-400">×</span>
                <div className="flex flex-col items-center">
                  <div className="border-l-[2px] border-r-[2px] border-slate-700 px-2 grid grid-cols-1 gap-y-1 text-center bg-slate-100">
                    <span>{pair.pVals[0]}</span><span>{pair.pVals[1]}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans font-bold mt-1">{pair.pChars[0]} {pair.pChars[1]}</span>
                </div>
                <span className="text-slate-400">=</span>
                <div className="flex flex-col items-center">
                  <div className="border-l-[2px] border-r-[2px] border-purple-500 px-2 grid grid-cols-1 gap-y-1 text-center bg-pink-50 text-purple-700 font-bold">
                    <span>{pair.cVals[0]}</span><span>{pair.cVals[1]}</span>
                  </div>
                  <span className="text-[10px] text-purple-600 font-sans font-black mt-1">{pair.cChars[0]} {pair.cChars[1]}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 text-center font-mono bg-slate-50 px-3 py-1 rounded-lg">
                <p>{pair.calc1}</p>
                <p>{pair.calc2}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'enigma') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 text-center uppercase mb-4">Simulasi Perputaran Rotor (Odometer)</p>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-x-2 gap-y-3 text-sm font-mono items-center justify-items-center">
          {data.steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="bg-slate-100 w-8 h-8 flex justify-center items-center rounded-lg text-slate-600 font-bold shadow-sm">{s.inChar}</div>
              <span className="text-slate-300">→</span>
              <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-[0.3em] flex gap-1 shadow-inner border border-purple-200">
                <span className="w-4 text-center">{s.pos[0]}</span>
                <span className="w-4 text-center">{s.pos[1]}</span>
                <span className="w-4 text-center">{s.pos[2]}</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="bg-pink-100 w-8 h-8 flex justify-center items-center rounded-lg font-black text-pink-700 shadow-sm border border-pink-200">{s.outChar}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return null;
}


// --- LEARN TAB ---
const videoLibrary = {
  vigenere: [
    { title: "Konsep & Sejarah Vigenere Cipher", id: "skkdJjqMQJQ", desc: "Algoritma polialfabetik yang pernah dianggap tidak bisa dipecahkan." },
    { title: "Cara Kerja Vigenere Square", id: "9zHjMTtBvWk", desc: "Penjelasan matematis menggunakan tabel tabula recta." },
    { title: "Kelemahan & Analisis Frekuensi", id: "E31D9B0yE3Q", desc: "Bagaimana cara Babbage memecahkan Vigenere." },
    { title: "Vigenere vs Caesar Cipher", id: "OzbYJ_wKk_w", desc: "Perbandingan keamanan antara dua algoritma bersejarah." },
    { title: "Implementasi Vigenere Modern", id: "JbJvKio2dDU", desc: "Relevansi sistem polyalphabetic di era modern." }
  ],
  affine: [
    { title: "Pengenalan Affine Cipher", id: "1X3t4R0a_sU", desc: "Kombinasi perkalian dan pergeseran dalam matematika modular." },
    { title: "Mencari Invers Modulo 26", id: "_XW161Jq-hA", desc: "Pentingnya syarat Coprime pada parameter A." },
    { title: "Contoh Enkripsi Affine", id: "U8QfH4J4E50", desc: "Langkah demi langkah mengenkripsi teks dengan Affine." },
    { title: "Dekripsi dengan Rumus Invers", id: "Z0wZ-Xn_rJw", desc: "Cara mengembalikan teks asli menggunakan invers matematika." },
    { title: "Kriptanalisis Affine", id: "7K_V_eX6E9c", desc: "Brute force dan analisis huruf tersering pada Affine." }
  ],
  playfair: [
    { title: "Memahami Playfair Cipher", id: "quKMQvJpUQQ", desc: "Teknik enkripsi berbasis grid 5x5 dan substitusi digraf." },
    { title: "Aturan Baris, Kolom, & Persegi", id: "zN89sNGEyA4", desc: "Tiga aturan utama pergeseran Playfair." },
    { title: "Pembuatan Matriks Kunci", id: "8qE_3K159B0", desc: "Cara menyusun alfabet di dalam kotak 5x5." },
    { title: "Enkripsi Digraf Playfair", id: "H29h1s2Lw6g", desc: "Mengapa Playfair lebih kuat dari substitusi sederhana." },
    { title: "Playfair dalam Sejarah", id: "6K-Q5B_K1sU", desc: "Penggunaan Playfair pada perang dunia pertama." }
  ],
  hill: [
    { title: "Aljabar Linear dalam Kriptografi", id: "kK3c1_A_GkM", desc: "Pengenalan Hill Cipher menggunakan operasi matriks." },
    { title: "Determinan & Matriks Invers", id: "V-M2_Vv6_9w", desc: "Syarat wajib matriks 2x2 agar bisa digunakan sebagai kunci." },
    { title: "Enkripsi Hill Cipher (Matriks 2x2)", id: "2G_D_8h8_5o", desc: "Perkalian matriks modulo 26 untuk menyembunyikan pesan." },
    { title: "Dekripsi Teks Sandi Hill", id: "5u3e9Y3w8L4", desc: "Menerapkan matriks invers pada ciphertext." },
    { title: "Kerentanan Hill Cipher", id: "X2b1_B4Y8_A", desc: "Kejahatan Known-Plaintext Attack pada Hill Cipher." }
  ],
  enigma: [
    { title: "Mesin Enigma Perang Dunia II", id: "G2_Q9FoD-oQ", desc: "Visualisasi mekanik dari mesin Enigma legendaris." },
    { title: "Sistem Rotor & Stepping", id: "ASfAPOiq_eQ", desc: "Cara kerja odometer dan scrambling kabel di dalam Enigma." },
    { title: "Peran Reflektor Enigma", id: "V4V2bpZlqx8", desc: "Mengapa sebuah huruf tidak pernah dienkripsi menjadi dirinya sendiri." },
    { title: "Steckerbrett (Plugboard)", id: "d2Nw8g2w0A0", desc: "Lapisan keamanan tambahan yang menyulitkan Sekutu." },
    { title: "Alan Turing & Bombe", id: "9U_1_1V8_7o", desc: "Bagaimana Bletchley Park memecahkan kode Enigma." }
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
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Pustaka Video</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Tonton penjelasan dari para ahli</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === key ? 'bg-purple-600 text-white shadow-md' : 'bg-white/50 text-slate-600 hover:bg-white/80'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={selectedCategory} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col xl:flex-row gap-5 md:gap-8">
        <div className="flex-[1.618] glass-card rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg flex flex-col border border-white/60">
          <a href={`https://www.youtube.com/watch?v=${heroVideo.id}`} target="_blank" rel="noopener noreferrer" className="relative block w-full bg-slate-900 aspect-video xl:aspect-[1.618/1] group cursor-pointer overflow-hidden">
            <img src={`https://img.youtube.com/vi/${heroVideo.id}/hqdefault.jpg`} alt={heroVideo.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(219,39,119,0.5)] group-hover:scale-110 transition-transform duration-300">
                <Play size={32} className="ml-2 md:w-[40px] md:h-[40px]" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 text-white/90 text-xs font-medium">Buka di YouTube <ChevronRight size={14} /></div>
          </a>
          <div className="p-5 md:p-8 flex-1 flex flex-col bg-gradient-to-br from-white/90 to-purple-50/90">
            <span className="text-[10px] md:text-xs font-black text-pink-500 uppercase tracking-widest mb-2">Video Utama</span>
            <h3 className="font-black text-slate-800 flex items-start gap-2 md:gap-4 mb-2 md:mb-4 text-xl md:text-3xl leading-tight">{heroVideo.title}</h3>
            <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium">{heroVideo.desc}</p>
          </div>
        </div>

        <div className="flex-[1] flex flex-col gap-4 md:gap-6">
          {sideVideos.map((vid, idx) => (
             <div key={idx} className="glass-card rounded-xl md:rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col sm:flex-row xl:flex-col border border-white/60">
                <div className="w-full sm:w-2/5 xl:w-full relative overflow-hidden aspect-video shrink-0 bg-slate-900">
                  <a href={`https://www.youtube.com/watch?v=${vid.id}`} target="_blank" rel="noopener noreferrer" className="relative block w-full h-full group cursor-pointer">
                    <img src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`} alt={vid.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play size={18} className="ml-1 md:w-[24px] md:h-[24px]" fill="currentColor" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="p-3 md:p-5 flex-1 flex flex-col justify-center bg-white/80">
                  <h3 className="font-extrabold text-slate-800 text-sm md:text-lg leading-tight mb-1 md:mb-2 line-clamp-2">{vid.title}</h3>
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
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const handleAnswer = (index) => {
    // Pencegahan double klik yang cepat saat proses animasi jalan
    if (selectedOpt !== null) return; 

    setSelectedOpt(index);
    setTimeout(() => {
      if (index === quizData[step].a) {
        setCorrectCount(c => c + 1);
      }
      
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
    setCorrectCount(0); 
    setIsFinished(false); 
    setSelectedOpt(null); 
  };

  if (isFinished) {
    // Perhitungan skor berdasarkan persentase jawaban benar 
    // sehingga selalu maksimal 100 meskipun berapapun soal ditambahkan.
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
          {/* Progress bar visual bug dipulihkan: menyesuaikan inklusif terhadap soal yang sedang dikerjakan */}
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

// --- REUSABLE UI COMPONENTS ---
function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`relative flex md:flex-col items-center justify-center gap-1 md:gap-2 p-2.5 md:p-3 w-full md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 group overflow-hidden ${active ? 'text-white shadow-md md:shadow-lg transform md:scale-105 bg-gradient-to-br from-purple-600 to-pink-500' : 'text-slate-500 hover:text-purple-600 hover:bg-white/80 hover:shadow-sm'}`}>
      <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>{icon}</div>
      <span className={`relative z-10 text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
      {active && <div className="absolute inset-0 bg-white/20 blur-sm rounded-xl md:rounded-2xl"></div>}
    </button>
  );
}