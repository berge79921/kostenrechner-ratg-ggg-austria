import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'light' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, variant = 'light' }) => {
  // Base: Strong blur, rounded corners, smooth transition
  const baseStyles = "relative overflow-hidden rounded-[2.5rem] transition-all duration-500 backdrop-blur-3xl group";
  
  const variants = {
    // Light: Gradient from top-left (white) to bottom-right (transparent), inner white ring for edge definition
    light: "bg-gradient-to-br from-white/80 via-white/60 to-white/30 border border-white/60 text-slate-900 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] ring-1 ring-inset ring-white/80",
    
    // Dark: Deep dark gradient, subtle border
    dark: "bg-gradient-to-br from-slate-800/95 via-slate-900/90 to-slate-950/90 border border-white/10 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5"
  };

  const titleColor = variant === 'light' ? 'text-slate-900 border-slate-900/10' : 'text-white/90 border-white/10';

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {/* Liquid Shine Effect - Simulates light hitting the surface */}
      <div className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b ${variant === 'light' ? 'from-white/40' : 'from-white/5'} to-transparent pointer-events-none`}></div>
      
      {/* Decorational blurry blobs for "internal liquid" feel */}
      {variant === 'dark' && (
        <>
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-500/20 blur-[60px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
        </>
      )}
      {variant === 'light' && (
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/60 blur-[60px] pointer-events-none"></div>
      )}
      
      <div className="relative z-10 p-8">
        {title && (
          <h2 className={`mb-8 text-3xl font-bold tracking-tight pb-4 border-b ${titleColor}`}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};