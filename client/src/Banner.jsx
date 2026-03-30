import React from 'react';
import logo from './assets/EcoTrack_Logo.svg';
import bannerImg from './assets/Image_Banner.jpg';

function Banner({ isShrunk, searchTerm, onSearchChange, onLogout }) {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out flex items-center shadow-xl overflow-hidden
      ${isShrunk 
        ? 'h-20 bg-slate-900 px-8 flex-row justify-between' 
        : 'h-[350px] bg-slate-800 flex-col justify-center px-6'}`}>
      
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={bannerImg} 
          alt="EcoTrack Banner Background" 
          className={`w-full h-full object-cover transition-all duration-700 
            ${isShrunk ? 'blur-md opacity-20' : 'opacity-40'}`} 
        />
        <div className="absolute inset-0 bg-slate-900/40"></div>
      </div>

      {/* Logo Container */}
      <div className={`z-20 transition-all duration-500 ease-in-out transform
        ${isShrunk 
          ? 'scale-[0.4] origin-left' 
          : 'scale-100 mb-8'}`}>
        <img 
          src={logo} 
          alt="EcoTrack Logo" 
          className="w-64 h-auto drop-shadow-2xl" 
        />
      </div>

      {/* Actions Container */}
      <div className={`z-30 flex transition-all duration-500 ease-in-out
        ${isShrunk 
          ? 'flex-row items-center gap-6' 
          : 'flex-col items-center w-full max-w-lg'}`}>
        
        {/* Search Bar */}
        <div className={`transition-all duration-500 ease-in-out
          ${isShrunk ? 'w-64' : 'w-full'}`}>
          <div className="flex items-center bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20">
            <span className="pl-3 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search systems..." 
              className="flex-1 bg-transparent px-4 py-1 outline-none text-slate-800 font-medium"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Logout Button: Absolute when large, Relative when shrunk */}
        <button 
          onClick={onLogout}
          className={`font-bold uppercase tracking-widest transition-all drop-shadow-md hover:text-white whitespace-nowrap
            ${isShrunk 
              ? 'static text-white/70 text-xs' 
              : 'absolute top-8 right-10 text-white/50 text-[10px]'}`}
        >
          Logout
        </button>
      </div>

    </header>
  );
}

export default Banner;