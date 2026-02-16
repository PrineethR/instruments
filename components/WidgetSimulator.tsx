import React, { useState, useEffect, useRef } from 'react';
import { Zap, Aperture, Maximize, Grid3X3, Circle, Play, Plus, Minus, ChevronUp, ChevronDown, Clock, Check } from 'lucide-react';

// --- Shared Chassis Component ---
const Chassis: React.FC<{ children: React.ReactNode; label: string; active?: boolean }> = ({ children, label, active }) => (
  <div className="flex flex-col items-center gap-6 group perspective-1000">
    <div className={`
      w-[320px] h-[340px] bg-[#E3E2DE] rounded-[32px] p-3 shadow-2xl flex flex-col relative overflow-hidden
      transition-all duration-500 ease-out transform group-hover:rotate-x-2 group-hover:rotate-y-2
      border border-white/40 ring-1 ring-black/5
    `}>
      {/* Screw holes */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-stone-400/30 inset-shadow"></div>
      <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-stone-400/30 inset-shadow"></div>
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-stone-400/30 inset-shadow"></div>
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-stone-400/30 inset-shadow"></div>
      
      {/* Content */}
      <div className="flex-1 w-full relative z-10">
        {children}
      </div>

      {/* Active Light */}
      {active && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
      )}
    </div>
    
    <div className="text-center space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-900 font-bold">{label}</h3>
      <div className="w-8 h-0.5 bg-stone-300 mx-auto rounded-full"></div>
    </div>
  </div>
);

// --- Component 1: The Listener (Audio) ---
export const AudioWidget = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setDuration(p => p + 1), 100);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const Dial = ({ label, angle }: { label: string, angle: number }) => (
    <div className="bg-[#D1D0CC] rounded-xl flex flex-col items-center justify-center relative w-full h-full shadow-inner border border-white/20">
      <div className="relative w-20 h-20 bg-[#1a1917] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
        <div 
          className="absolute w-2.5 h-2.5 bg-[#EAB308] rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]"
          style={{ transform: `rotate(${angle}deg) translate(32px) rotate(-${angle}deg)` }}
        />
      </div>
      <span className="absolute bottom-2 left-3 text-[9px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <Chassis label="OP-1 // Listener" active={isRecording}>
      <div className="flex flex-col h-full gap-2">
        {/* Screen */}
        <div className="h-14 bg-[#C8C7C4] rounded-xl flex items-center justify-between px-4 border border-black/5 inner-shadow">
           <span className={`font-mono text-2xl font-medium tabular-nums ${isRecording ? 'text-red-600' : 'text-stone-800'}`}>
             {isRecording ? "REC" : "RDY"}
           </span>
           <div className="flex flex-col items-end">
             <span className="text-[8px] font-mono text-stone-500">TAPE A</span>
             <span className="text-[10px] font-mono text-stone-800 tabular-nums">
               00:{(duration / 10).toFixed(1)}
             </span>
           </div>
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
          <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setIsRecording(!isRecording)}>
            <Dial label="Speed" angle={isRecording ? (Date.now() / 5) % 360 : 45} />
          </div>
          <Dial label="Rorare" angle={isRecording ? (Date.now() / 10) % 360 : 120} />
          <Dial label="VOL" angle={-45} />
          <Dial label="Effect" angle={90} />
        </div>
      </div>
    </Chassis>
  );
};

// --- Component 2: The Observer (Visual) ---
export const VisualWidget = () => {
  const [active, setActive] = useState(false);
  const [zoom, setZoom] = useState(50);

  return (
    <Chassis label="OB-4 // Observer" active={active}>
      <div className="flex flex-col h-full relative">
        {/* Main Lens */}
        <div className="flex-1 bg-[#1a1917] rounded-t-[20px] rounded-b-[4px] relative overflow-hidden flex items-center justify-center border-4 border-[#D1D0CC]">
           {active ? (
             <div className="absolute inset-0 bg-stone-800">
                <div className="w-full h-full opacity-50 bg-[url('https://images.unsplash.com/photo-1494587416117-f10426b704c8?auto=format&fit=crop&q=80')] bg-cover bg-center animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Maximize className="text-white/30 w-32 h-32 animate-spin-slow" strokeWidth={1} />
                </div>
                {/* Data overlay */}
                <div className="absolute bottom-2 left-4 text-[10px] font-mono text-[#EAB308]">ISO 400</div>
             </div>
           ) : (
             <div className="w-24 h-24 rounded-full bg-[#0a0a09] border-[6px] border-[#2a2927] shadow-[inset_0_0_20px_black] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#1a1917] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500/50 shadow-[0_0_10px_purple]"></div>
                </div>
             </div>
           )}
           
           {/* Shutter Button */}
           <button 
             onClick={() => setActive(!active)}
             className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-600 shadow-lg border-2 border-red-800 active:scale-90 transition-transform flex items-center justify-center"
           >
             <Aperture size={14} className="text-red-900" />
           </button>
        </div>

        {/* Controls */}
        <div className="h-32 bg-[#D1D0CC] rounded-b-[20px] rounded-t-[4px] mt-1 p-3 grid grid-cols-3 gap-2">
           {[1,2,3].map(i => (
             <div key={i} className="bg-[#C8C7C4] rounded-lg relative flex items-center justify-center group cursor-grab active:cursor-grabbing">
               <div className="w-1.5 h-20 bg-[#a8a29e] rounded-full relative overflow-hidden">
                 <div className="absolute bottom-0 w-full bg-[#EAB308]" style={{ height: `${30 * i}%` }}></div>
               </div>
               <div className="absolute bottom-2 text-[8px] font-mono font-bold text-stone-500">CH.{i}</div>
             </div>
           ))}
        </div>
      </div>
    </Chassis>
  );
};

// --- Component 3: The Composer (Haptic) ---
export const HapticWidget = () => {
  const [grid, setGrid] = useState<boolean[]>(Array(16).fill(false));
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (playing) {
      interval = setInterval(() => {
        setBeat(b => (b + 1) % 16);
      }, 150);
    } else {
      setBeat(0);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const toggleCell = (i: number) => {
    const newGrid = [...grid];
    newGrid[i] = !newGrid[i];
    setGrid(newGrid);
  };

  return (
    <Chassis label="TX-6 // Composer" active={playing}>
      <div className="flex flex-col h-full gap-3">
        {/* Top Controls */}
        <div className="h-16 flex items-center gap-3">
           <div className="flex-1 h-full bg-[#1a1917] rounded-xl flex items-center justify-center gap-1 px-2 overflow-hidden relative">
              {[...Array(8)].map((_,i) => (
                <div key={i} className={`w-1 h-full rounded-full transition-all duration-75 ${
                  playing && beat % 8 === i ? 'bg-[#EAB308] h-3/4' : 'bg-stone-800 h-1/4'
                }`}></div>
              ))}
              <span className="absolute top-1 left-2 text-[8px] font-mono text-stone-500">SEQ-1</span>
           </div>
           
           <button 
            onClick={() => setPlaying(!playing)}
            className={`w-16 h-full rounded-xl flex items-center justify-center transition-all active:scale-95 ${playing ? 'bg-[#EAB308] text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-[#D1D0CC] text-stone-500 shadow-inner'}`}
           >
             <Play size={20} fill={playing ? "currentColor" : "none"} />
           </button>
        </div>

        {/* 16-Step Grid */}
        <div className="flex-1 bg-[#D1D0CC] rounded-xl p-3 grid grid-cols-4 grid-rows-4 gap-2 shadow-inner border border-white/20">
          {grid.map((active, i) => (
            <button
              key={i}
              onClick={() => toggleCell(i)}
              className={`
                rounded-md relative transition-all duration-100 flex items-center justify-center
                ${active 
                  ? 'bg-stone-800 shadow-[0_2px_5px_rgba(0,0,0,0.3)] translate-y-px' 
                  : 'bg-[#C8C7C4] shadow-[0_2px_0_#a8a29e] hover:bg-stone-300 -translate-y-0.5 active:translate-y-0 active:shadow-none'}
                ${playing && beat === i ? 'ring-2 ring-[#EAB308] ring-offset-1 ring-offset-[#D1D0CC]' : ''}
              `}
            >
              {active && <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] shadow-[0_0_4px_orange]"></div>}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between px-2">
           <span className="text-[9px] font-mono text-stone-400 uppercase">Pattern A</span>
           <span className="text-[9px] font-mono text-stone-400 uppercase">120 BPM</span>
        </div>
      </div>
    </Chassis>
  );
};

// --- Component 4: The Karri (Walkie Talkie) ---
export const KarriWidget = () => {
  const [isTalking, setIsTalking] = useState(false);

  const patterns: Record<string, number[]> = {
    K: [1,0,0,0,1, 1,0,0,1,0, 1,0,1,0,0, 1,1,0,0,0, 1,0,1,0,0, 1,0,0,1,0, 1,0,0,0,1],
    A: [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
    R: [1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
    I: [0,1,1,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
  };

  const renderChar = (char: string) => (
    <div className="grid grid-cols-5 gap-1">
      {patterns[char]?.map((on, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${on ? 'bg-white shadow-[0_0_3px_rgba(255,255,255,0.8)] scale-100' : 'bg-black/10 scale-75'}`} />
      )) || null}
    </div>
  );

  return (
    <div className="group perspective-1000 flex flex-col items-center gap-6">
      <div className={`
        w-[320px] h-[480px] bg-[#4B8BF5] rounded-[40px] p-6 shadow-2xl flex flex-col relative
        transition-all duration-500 ease-out transform group-hover:rotate-x-2 group-hover:rotate-y-2
        border-t border-l border-white/20 ring-1 ring-black/10
      `}>
        {/* Top Buttons (Triggers) */}
        <div className="absolute -top-1 left-12 w-8 h-2 bg-[#3a75d9] rounded-t-md"></div>
        <div className="absolute -top-1 right-12 w-8 h-2 bg-[#3a75d9] rounded-t-md"></div>

        {/* Side Button Hint */}
        <div className="absolute top-24 -left-1 w-1 h-12 bg-[#356ac4] rounded-l-md border-r border-black/10"></div>

        {/* Display Area */}
        <div className="h-32 flex items-center justify-center gap-3 mt-8 mb-8">
           {['K', 'A', 'R', 'R', 'I'].map((c, i) => (
             <div key={i} className={isTalking ? 'animate-pulse' : ''}>{renderChar(c)}</div>
           ))}
        </div>

        {/* Controls Container */}
        <div className="flex-1 flex items-center justify-between px-2 gap-4">
           {/* Left: Vol */}
           <div className="w-16 h-36 bg-[#3a75d9] rounded-[32px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-between py-6 border-b border-white/5">
              <button className="text-[#2554a3] hover:text-white/90 transition-colors active:scale-90 p-2"><Plus size={24} strokeWidth={3} /></button>
              <button className="text-[#2554a3] hover:text-white/90 transition-colors active:scale-90 p-2"><Minus size={24} strokeWidth={3} /></button>
           </div>

           {/* Center: Action (The big orange pill) */}
           <div className="w-20 h-40 bg-[#356ac4] rounded-[40px] flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)] relative">
              <button 
                onMouseDown={() => setIsTalking(true)}
                onMouseUp={() => setIsTalking(false)}
                onMouseLeave={() => setIsTalking(false)}
                className={`
                  w-14 h-32 rounded-[28px] transition-all duration-100 ease-out
                  ${isTalking 
                    ? 'bg-[#E04F35] shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-1 scale-95' 
                    : 'bg-[#FF5A3D] shadow-[0_6px_0_#c43e26,0_12px_15px_rgba(0,0,0,0.25)] -translate-y-1 hover:-translate-y-0.5 hover:shadow-[0_5px_0_#c43e26]'}
                `}
              ></button>
           </div>

           {/* Right: Nav */}
           <div className="flex flex-col gap-4">
              <button className="w-16 h-16 bg-[#3a75d9] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#2554a3] hover:text-white/90 transition-colors active:scale-95 border-b border-white/5">
                 <ChevronUp size={28} strokeWidth={3} />
              </button>
              <button className="w-16 h-16 bg-[#3a75d9] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#2554a3] hover:text-white/90 transition-colors active:scale-95 border-b border-white/5">
                 <ChevronDown size={28} strokeWidth={3} />
              </button>
           </div>
        </div>

        {/* Speaker Grille */}
        <div className="mt-auto mb-2 px-6 pb-6">
           <div className="grid grid-cols-12 gap-x-2 gap-y-2">
             {[...Array(36)].map((_, i) => (
               <div key={i} className="w-1.5 h-1.5 bg-[#1a3a75] rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]"></div>
             ))}
           </div>
        </div>

      </div>
       <div className="text-center space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-900 font-bold">R-01 // KARRI</h3>
        <div className="w-8 h-0.5 bg-stone-300 mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

// --- Component 5: Dial In (Context Check-in) ---
export const DialInWidget = () => {
  type Mode = 'ENERGY' | 'WORK' | 'CHILL' | 'REFLECT';
  const [mode, setMode] = useState<Mode>('WORK');
  const [submitted, setSubmitted] = useState(false);
  const [knobValue, setKnobValue] = useState(50);
  const [sliderValue, setSliderValue] = useState(50);
  const [switchValue, setSwitchValue] = useState(false);
  
  // Calculate initial mode based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) setMode('ENERGY');
    else if (hour >= 11 && hour < 17) setMode('WORK');
    else if (hour >= 17 && hour < 22) setMode('CHILL');
    else setMode('REFLECT');
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const cycleMode = () => {
    const modes: Mode[] = ['ENERGY', 'WORK', 'CHILL', 'REFLECT'];
    const idx = modes.indexOf(mode);
    setMode(modes[(idx + 1) % 4]);
    setSubmitted(false);
  };

  const config = {
    ENERGY: {
      color: 'bg-[#FFFAF0]',
      accent: 'text-amber-600',
      label: 'ENERGY CHECK',
      question: 'Ready to engage?',
      prompt: 'Toggle',
    },
    WORK: {
      color: 'bg-[#f0f0f0]',
      accent: 'text-stone-600',
      label: 'DEEP WORK',
      question: 'How clear is your thinking?',
      prompt: 'Dial',
    },
    CHILL: {
      color: 'bg-[#F5E6D3]',
      accent: 'text-orange-900',
      label: 'DECOMPRESS',
      question: 'Energy reserves?',
      prompt: 'Slider',
    },
    REFLECT: {
      color: 'bg-[#1a2332]',
      accent: 'text-blue-100',
      label: 'REFLECT',
      question: 'Good moment today?',
      prompt: 'Button',
    }
  };

  const currentConfig = config[mode];

  // Hardware Controls
  
  const RotaryKnob = () => {
    // Simple drag interaction simulator
    const knobRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = (e: React.MouseEvent) => {
      if (e.buttons !== 1) return;
      // Just visually increment for demo
      setKnobValue(prev => Math.min(100, Math.max(0, prev - e.movementY)));
    };

    return (
      <div className="flex flex-col items-center justify-center gap-6" onMouseMove={handleMouseMove}>
        <div 
          ref={knobRef}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-stone-800 to-black shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_2px_3px_rgba(255,255,255,0.1)] relative cursor-grab active:cursor-grabbing flex items-center justify-center border-4 border-[#2a2927]"
          style={{ transform: `rotate(${(knobValue / 100) * 270 - 135}deg)` }}
          onMouseDown={() => {}}
        >
          {/* Indicator Line */}
          <div className="absolute top-2 w-1 h-6 bg-white rounded-full shadow-[0_0_5px_white]"></div>
          {/* Grip Texture */}
          <div className="absolute inset-0 rounded-full border-[12px] border-dashed border-stone-800/50 opacity-40"></div>
        </div>
        <div className="text-xs font-mono text-stone-400 tracking-widest">{knobValue}%</div>
      </div>
    );
  };

  const Slider = () => (
    <div className="w-full px-4 flex flex-col items-center gap-4">
      <div className="w-full h-3 bg-[#d6d3d1] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] relative flex items-center">
        {/* Track Fill */}
        <div className="h-full bg-orange-900/10 rounded-l-full" style={{ width: `${sliderValue}%` }}></div>
        
        {/* Handle */}
        <div 
          className="absolute h-8 w-12 bg-gradient-to-b from-[#f5f5f4] to-[#e7e5e4] rounded border border-stone-400 shadow-[0_4px_6px_rgba(0,0,0,0.2),inset_0_1px_0_white] cursor-grab active:cursor-grabbing flex items-center justify-center gap-0.5"
          style={{ left: `calc(${sliderValue}% - 24px)` }}
          onMouseDown={(e) => {
            // Simplified interaction logic
            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
            const update = (moveE: MouseEvent) => {
              if(!rect) return;
              const x = moveE.clientX - rect.left;
              const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
              setSliderValue(pct);
            };
            const stop = () => {
              window.removeEventListener('mousemove', update);
              window.removeEventListener('mouseup', stop);
              handleSubmit();
            };
            window.addEventListener('mousemove', update);
            window.addEventListener('mouseup', stop);
          }}
        >
          {/* Grip lines */}
          <div className="w-px h-4 bg-stone-300"></div>
          <div className="w-px h-4 bg-stone-300"></div>
          <div className="w-px h-4 bg-stone-300"></div>
        </div>
      </div>
      <div className="flex justify-between w-full text-[10px] font-mono font-bold text-stone-400 uppercase">
        <span>Empty</span>
        <span>Full</span>
      </div>
    </div>
  );

  const ToggleSwitch = () => (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={() => { setSwitchValue(!switchValue); handleSubmit(); }}
        className={`
          w-20 h-36 rounded-2xl shadow-[0_4px_0_#d1d5db,0_8px_15px_rgba(0,0,0,0.1)] border border-stone-200 cursor-pointer relative overflow-hidden transition-colors duration-300
          ${switchValue ? 'bg-amber-100' : 'bg-stone-100'}
        `}
      >
        <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)]"></div>
        {/* Screws */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-300 flex items-center justify-center"><div className="w-full h-px bg-stone-400 rotate-45"></div></div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-300 flex items-center justify-center"><div className="w-full h-px bg-stone-400 rotate-45"></div></div>
        
        {/* Switch Body */}
        <div className={`
          absolute left-1/2 -translate-x-1/2 w-12 h-20 bg-gradient-to-b from-stone-800 to-stone-600 rounded-md shadow-xl transition-all duration-200 ease-out flex items-center justify-center
          ${switchValue ? 'top-4' : 'bottom-4'}
        `}>
           <div className="w-1 h-8 bg-stone-700 rounded-full"></div>
        </div>
      </div>
      <span className={`font-mono text-xs font-bold tracking-widest ${switchValue ? 'text-amber-600' : 'text-stone-400'}`}>
        {switchValue ? 'ENGAGED' : 'STANDBY'}
      </span>
    </div>
  );

  const BigButton = () => (
    <div className="flex flex-col items-center justify-center">
      <button 
        onClick={handleSubmit}
        className="
          w-32 h-32 rounded-full bg-[#1a2332] relative group outline-none
          shadow-[0_10px_20px_rgba(0,0,0,0.4),0_0_0_8px_#2d3748]
          active:shadow-[0_2px_5px_rgba(0,0,0,0.4),0_0_0_8px_#2d3748]
          active:translate-y-2 transition-all duration-100
        "
      >
        {/* Concave surface */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#141b26] to-[#202b3d] shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
           <div className="w-4 h-4 rounded-full bg-blue-500/20 shadow-[0_0_10px_blue] group-active:bg-blue-400/80 transition-colors"></div>
        </div>
      </button>
      <span className="mt-6 font-serif italic text-blue-200/50 text-sm">Mark Moment</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 group perspective-1000">
      <div className={`
        w-[320px] h-[340px] rounded-[32px] p-6 shadow-2xl flex flex-col relative overflow-hidden
        transition-all duration-500 ease-out transform group-hover:rotate-x-2 group-hover:rotate-y-2
        border border-white/10 ring-1 ring-black/5
        ${currentConfig.color}
      `}>
         {/* Feedback Overlay */}
         {submitted && (
           <div className="absolute inset-0 z-20 bg-black/10 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
              <div className="bg-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                <span className="font-sans font-bold text-stone-800 text-sm">Noted</span>
              </div>
           </div>
         )}

         {/* Header */}
         <div className="flex justify-between items-start mb-8 select-none">
            <div onClick={cycleMode} className="cursor-pointer group/label">
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${mode === 'REFLECT' ? 'bg-blue-400' : 'bg-amber-500'} animate-pulse`}></div>
                 <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${currentConfig.accent}`}>
                   {currentConfig.label}
                 </span>
               </div>
               <span className="text-[9px] text-stone-400 opacity-0 group-hover/label:opacity-100 transition-opacity absolute mt-1">
                 (tap to cycle)
               </span>
            </div>
            <div className={`text-sm font-mono opacity-50 ${mode === 'REFLECT' ? 'text-white' : 'text-stone-900'}`}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
         </div>

         {/* Prompt */}
         <div className="text-center mb-8 h-16 flex items-center justify-center">
            <h3 className={`font-serif text-xl ${mode === 'REFLECT' ? 'text-white' : 'text-stone-800'} leading-tight`}>
              "{currentConfig.question}"
            </h3>
         </div>

         {/* Active Control Area */}
         <div className="flex-1 flex items-center justify-center relative">
            {mode === 'WORK' && <RotaryKnob />}
            {mode === 'CHILL' && <Slider />}
            {mode === 'ENERGY' && <ToggleSwitch />}
            {mode === 'REFLECT' && <BigButton />}
         </div>

      </div>
      
      <div className="text-center space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-900 font-bold">BR-5 // DIAL IN</h3>
        <div className="w-8 h-0.5 bg-stone-300 mx-auto rounded-full"></div>
      </div>
    </div>
  );
};