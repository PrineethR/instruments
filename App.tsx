import React from 'react';
import { AudioWidget, VisualWidget, HapticWidget, KarriWidget, DialInWidget } from './components/WidgetSimulator';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#f0f0f0] flex flex-col items-center py-20 px-8 font-sans selection:bg-[#EAB308] selection:text-black">
      
      {/* Header */}
      <div className="max-w-4xl w-full text-center space-y-6 mb-24">
        <h1 className="text-4xl md:text-6xl font-serif font-medium text-[#1c1917] tracking-tight">
          Input Modules
        </h1>
        <p className="text-stone-500 font-serif italic max-w-xl mx-auto">
          "Select your instrument of confusion. Each device offers a different modality for capturing the fleeting nature of thought."
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm">
           <div className="w-2 h-2 bg-[#EAB308] rounded-full animate-pulse"></div>
           <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Prototype Series 001</span>
        </div>
      </div>

      {/* Product Gallery - Responsive Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-x-16 gap-y-24 items-center justify-center w-full max-w-7xl mx-auto">
        
        {/* Module 1 */}
        <div className="flex flex-col items-center">
           <AudioWidget />
        </div>

        {/* Module 2 */}
        <div className="flex flex-col items-center">
           <VisualWidget />
        </div>

        {/* Module 3 */}
        <div className="flex flex-col items-center">
           <HapticWidget />
        </div>

        {/* Module 4 */}
        <div className="flex flex-col items-center">
           <KarriWidget />
        </div>

        {/* Module 5 */}
        <div className="flex flex-col items-center xl:col-span-2 2xl:col-span-1">
           <DialInWidget />
        </div>

      </div>

      {/* Footer */}
      <div className="mt-32 text-center space-y-2 opacity-40">
        <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">Designed for Compass OS</p>
        <p className="font-serif text-xs text-stone-400 italic">Input is the first step of letting go.</p>
      </div>

    </div>
  );
}