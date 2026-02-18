import React, { useRef, useEffect } from 'react';
import { AudioWidget, VisualWidget, HapticWidget, KarriWidget, DialInWidget, KnobWidget } from './components/WidgetSimulator';

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map vertical scroll (mouse wheel) to horizontal scrolling
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;

      // If the user is scrolling vertically (deltaY), we map it to horizontal (scrollLeft)
      // We allow native horizontal scrolling (deltaX) to pass through naturally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        // Standardize scroll speed slightly
        el.scrollLeft += e.deltaY;
      }
    };

    // Use { passive: false } to allow preventDefault
    el.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#d6d3d1] overflow-hidden flex flex-col relative selection:bg-[#EAB308] selection:text-black">
      
      {/* Table Surface Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply z-0"></div>
      
      {/* Fixed Header (Floating above the table) */}
      <div className="absolute top-8 left-8 z-50 mix-blend-difference text-[#1c1917]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
           <div className="w-1.5 h-1.5 bg-[#EAB308] rounded-full animate-pulse"></div>
           <span className="text-[10px] font-mono uppercase tracking-widest text-stone-800 font-bold">Prototype Series 001</span>
        </div>
      </div>

      {/* Main Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex-1 w-full overflow-x-auto overflow-y-hidden flex items-center px-[10vw] gap-[15vw] hide-scrollbar relative z-10 cursor-ew-resize snap-x snap-proximity flex-nowrap"
      >
        
        {/* Intro Section - Snap Point */}
        <div className="min-w-[400px] snap-center flex flex-col justify-center space-y-6 flex-shrink-0">
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-[#1c1917] tracking-tight leading-[0.9]">
            Confusion<br/>Companion
          </h1>
          <p className="text-stone-600 font-serif italic text-lg max-w-sm border-l-2 border-stone-400 pl-4">
            "Select your instrument. Each device offers a different modality for capturing the fleeting nature of thought."
          </p>
          <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 pt-12">
            SCROLL TO EXPLORE &rarr;
          </div>
        </div>

        {/* Widgets - Snap Points */}
        <div className="snap-center pt-10 flex-shrink-0">
           <AudioWidget />
        </div>

        <div className="snap-center pt-10 flex-shrink-0">
           <VisualWidget />
        </div>

        <div className="snap-center pt-10 flex-shrink-0">
           <HapticWidget />
        </div>

        <div className="snap-center pt-10 flex-shrink-0">
           <KarriWidget />
        </div>

        <div className="snap-center pt-10 flex-shrink-0">
           <DialInWidget />
        </div>
        
        <div className="snap-center pt-10 flex-shrink-0">
           <KnobWidget />
        </div>

        {/* Outro / Footer */}
        <div className="min-w-[400px] snap-center flex flex-col justify-center items-start opacity-60 flex-shrink-0">
           <div className="w-16 h-1 bg-stone-400 mb-6"></div>
           <p className="font-mono text-xs uppercase tracking-widest text-stone-600 font-bold">End of Workbench</p>
           <p className="font-serif text-sm text-stone-500 italic mt-2 max-w-xs">
             Input is the first step of letting go. <br/>
             Processing...
           </p>
        </div>

      </div>

      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)] z-20"></div>

    </div>
  );
}