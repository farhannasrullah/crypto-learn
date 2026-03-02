import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, ChevronRight } from 'lucide-react';
import { videoLibrary, categoryNames } from '../data/videoData';

export default function LearnTab({ state, setState }) {
  const { selectedCategory } = state;
  const setSelectedCategory = (cat) => setState({ ...state, selectedCategory: cat });

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