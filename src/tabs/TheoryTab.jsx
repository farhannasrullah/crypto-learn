import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Hash, Lightbulb } from 'lucide-react';

// Gunakan React.memo agar optimal
const TheoryTab = React.memo(({ state, setState }) => {
  const { selectedAlgo } = state;
  const setSelectedAlgo = (algo) => setState({ ...state, selectedAlgo: algo });

  // 🚀 PERBAIKAN: Mengubah string LaTeX mentah menjadi elemen JSX murni
  const theories = {
    vigenere: {
      title: "Vigenere Cipher", subtitle: "Substitusi Polialfabetik Klasik",
      desc: "Algoritma ini menggunakan sederetan sandi Caesar berdasarkan huruf-huruf pada kata kunci. Ini adalah contoh sederhana dari substitusi polialfabetik.",
      formulaEn: <>C<sub>i</sub> = (P<sub>i</sub> + K<sub>i</sub>) mod 26</>,
      formulaDe: <>P<sub>i</sub> = (C<sub>i</sub> - K<sub>i</sub> + 26) mod 26</>,
      rules: [
        "Huruf diubah menjadi angka: A=0, B=1, ... Z=25.",
        "Kata kunci diulang terus-menerus hingga panjangnya sama dengan teks asli.",
        "Proses dilakukan huruf demi huruf (i adalah indeks huruf)."
      ]
    },
    affine: {
      title: "Affine Cipher", subtitle: "Kombinasi Perkalian & Pergeseran",
      desc: "Affine cipher adalah jenis substitusi monoalfabetik yang setiap hurufnya dipetakan ke ekuivalen numeriknya, dienkripsi menggunakan fungsi linear sederhana.",
      formulaEn: <>C = (A &times; P + B) mod 26</>,
      formulaDe: <>P = A<sup>-1</sup> &times; (C - B) mod 26</>,
      rules: [
        "Kunci A (Multiplier) wajib memiliki nilai yang koprima dengan 26 (FPB(A, 26) = 1). Contoh: 1, 3, 5, 7, 9, 11, dst.",
        "Kunci B (Shift) bebas dari 0 hingga 25.",
        "A⁻¹ adalah Invers Modulo dari A terhadap 26."
      ]
    },
    playfair: {
      title: "Playfair Cipher", subtitle: "Enkripsi Digraf Berbasis Grid",
      desc: "Playfair merupakan sandi substitusi digraf pertama yang praktis. Mengenkripsi pasangan huruf (digraf) sekaligus menggunakan tabel/grid 5x5.",
      formulaEn: "Tiga Aturan Pergeseran Matriks 5x5", 
      formulaDe: "Kebalikan dari Tiga Aturan Matriks",
      rules: [
        "Huruf 'J' dilebur menjadi 'I' agar alfabet muat dalam grid 25 kotak.",
        "Jika digraf berada di baris yang sama, geser ke kanan 1 kotak.",
        "Jika digraf berada di kolom yang sama, geser ke bawah 1 kotak.",
        "Jika berbeda baris dan kolom, ambil huruf pada sudut horizontal yang berlawanan."
      ]
    },
    hill: {
      title: "Hill Cipher", subtitle: "Kriptografi Aljabar Linear",
      desc: "Diciptakan oleh Lester S. Hill, algoritma ini memanfaatkan konsep aljabar linear (perkalian matriks), menyembunyikan karakteristik huruf tunggal.",
      formulaEn: <><strong>C</strong> = (<strong>K</strong> &middot; <strong>P</strong>) mod 26</>,
      formulaDe: <><strong>P</strong> = (<strong>K</strong><sup>-1</sup> &middot; <strong>C</strong>) mod 26</>,
      rules: [
        "Pesan dibagi menjadi vektor blok berukuran n (misal 2x1 untuk matriks 2x2).",
        "Matriks Kunci (K) harus berupa matriks persegi.",
        "Syarat mutlak: Determinan Matriks Kunci harus koprima terhadap 26."
      ]
    },
    enigma: {
      title: "Mesin Enigma", subtitle: "Elektromekanis Perang Dunia II",
      desc: "Enigma menggunakan sistem rotor elektromekanis yang berputar setiap kali tuts ditekan, mengubah enkripsi secara dinamis untuk setiap huruf.",
      formulaEn: <>C = E<sub>reflektor</sub>(E<sub>rotor3</sub>(E<sub>rotor2</sub>(E<sub>rotor1</sub>(P))))</>,
      formulaDe: "Sama persis (Enigma bersifat Simetris)",
      rules: [
        "Mesin bersifat resiprokal: Jika A menjadi X, maka X pasti menjadi A.",
        "Rotor bergeser satu langkah setiap penekanan tombol. Rotor kedua bergerak jika rotor pertama mencapai titik 'notch'.",
        "Arus listrik melewati ketiga rotor, dipantulkan oleh Reflektor, dan kembali."
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

        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedAlgo}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}
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
                  {/* React akan merender tag HTML yang kita tulis di dalam JSX secara otomatis */}
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
});

export default TheoryTab;