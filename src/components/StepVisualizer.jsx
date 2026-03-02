import React from 'react';

export default function StepVisualizer({ data }) {
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