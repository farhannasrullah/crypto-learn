import React from 'react';

export default function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`relative flex md:flex-col items-center justify-center gap-1 md:gap-2 p-2.5 md:p-3 w-full md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 group overflow-hidden ${active ? 'text-white shadow-md md:shadow-lg transform md:scale-105 bg-gradient-to-br from-purple-600 to-pink-500' : 'text-slate-500 hover:text-purple-600 hover:bg-white/80 hover:shadow-sm'}`}>
      <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`}>{icon}</div>
      <span className={`relative z-10 text-[9px] md:text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
      {active && <div className="absolute inset-0 bg-white/20 blur-sm rounded-xl md:rounded-2xl"></div>}
    </button>
  );
}