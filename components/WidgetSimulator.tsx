import React, { useState, useEffect, useRef } from 'react';
import { Zap, Aperture, Maximize, Grid3X3, Circle, Play, Plus, Minus, ChevronUp, ChevronDown, Clock, Check, Mic, MicOff, Power, Radio } from 'lucide-react';

// --- Shared Chassis Component ---
const Chassis: React.FC<{ children: React.ReactNode; label: string; active?: boolean }> = ({ children, label, active }) => (
  <div className="flex flex-col items-center gap-6 group perspective-1000">
    <div className={`
      w-[88vw] max-w-[320px] h-[340px] bg-[#E3E2DE] rounded-[32px] p-4 shadow-2xl flex flex-col relative overflow-hidden
      transition-all duration-500 ease-out transform md:group-hover:rotate-x-2 md:group-hover:rotate-y-2
      border border-white/40 ring-1 ring-black/5
    `}>
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply"></div>

      {/* Screw holes - Industrial Detail */}
      <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-stone-400/30 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),1px_1px_0_white]">
        <div className="absolute inset-0.5 border border-stone-500/50 rounded-full"></div>
      </div>
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-stone-400/30 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),1px_1px_0_white]">
        <div className="absolute inset-0.5 border border-stone-500/50 rounded-full"></div>
      </div>
      <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-stone-400/30 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),1px_1px_0_white]">
        <div className="absolute inset-0.5 border border-stone-500/50 rounded-full"></div>
      </div>
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-stone-400/30 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),1px_1px_0_white]">
         <div className="absolute inset-0.5 border border-stone-500/50 rounded-full"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 w-full relative z-10 flex flex-col">
        {children}
      </div>

    </div>
    
    <div className="text-center space-y-1 opacity-60 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-900 font-bold">{label}</h3>
      <div className="w-8 h-0.5 bg-stone-300 mx-auto rounded-full"></div>
    </div>
  </div>
);

// --- Component 1: The Listener (Audio) ---
export const AudioWidget = () => {
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Knob states
  const [knobValues, setKnobValues] = useState({ gain: 45, tune: 10, mix: 90, fx: -120 });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Clear canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.fillStyle = '#0f1110';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw idle line
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          // Fix for webkitAudioContext type error
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
        } else {
            audioContextRef.current.resume();
        }

        const audioCtx = audioContextRef.current;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512; // Higher resolution
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyserRef.current = analyser;
        
        setIsRecording(true);
        visualize();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access denied or not available. Ensure you are using HTTPS.");
      }
    }
  };

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear with slight transparency for trail effect
      ctx.fillStyle = 'rgba(15, 17, 16, 0.4)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down

        // Gradient Color
        const r = barHeight + 100;
        const g = 50;
        const b = 50;
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
      
      // Draw a center line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  // Interactive Small Knob
  const HardwareKnob = ({ label, propKey }: { label: string, propKey: keyof typeof knobValues }) => {
    const knobRef = useRef<HTMLDivElement>(null);
    const value = knobValues[propKey];

    const startInteraction = (clientX: number, clientY: number) => {
      const element = knobRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let lastAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

      const handleMove = (x: number, y: number) => {
        const currentAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        let delta = currentAngle - lastAngle;
        
        // Handle wrapping
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        lastAngle = currentAngle;

        setKnobValues(prev => ({
          ...prev,
          [propKey]: Math.min(180, Math.max(-180, prev[propKey] + delta))
        }));
      };

      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling while adjusting knob
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      };

      const stopInteraction = () => {
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopInteraction);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', stopInteraction);
      };

      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopInteraction);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', stopInteraction);
    };

    return (
      <div className="flex flex-col items-center gap-2">
        <div 
          ref={knobRef}
          onMouseDown={(e) => { e.preventDefault(); startInteraction(e.clientX, e.clientY); }}
          onTouchStart={(e) => { startInteraction(e.touches[0].clientX, e.touches[0].clientY); }}
          className="w-16 h-16 rounded-full relative shadow-[0_6px_10px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.2)] bg-stone-200 cursor-grab active:cursor-grabbing touch-none"
          style={{ transform: `rotate(${value}deg)` }}
        >
          {/* Side of Knob (Depth) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-stone-200 to-stone-400"></div>
          
          {/* Top Face */}
          <div className="absolute inset-[2px] rounded-full bg-[conic-gradient(from_180deg,#e5e7eb,#d1d5db,#9ca3af,#d1d5db,#e5e7eb)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center">
               {/* Grip Texture */}
               <div className="w-full h-full rounded-full border-[6px] border-dashed border-stone-400/20"></div>
               {/* Indicator */}
               <div className="absolute top-1 w-1 h-5 bg-orange-500 rounded-full shadow-[0_0_2px_rgba(249,115,22,0.5)]"></div>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest select-none">{label}</span>
      </div>
    );
  };

  return (
    <Chassis label="OP-1 // Listener" active={isRecording}>
      <div className="flex flex-col h-full gap-4 pt-2">
        
        {/* Speaker Grille - Physical Detail */}
        <div className="flex justify-center gap-1.5 opacity-40">
           {[...Array(12)].map((_, i) => (
             <div key={i} className="w-1 h-1 bg-black rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]"></div>
           ))}
        </div>

        {/* The Screen (OLED style) */}
        <div className="h-28 bg-[#0f1110] rounded-xl border-2 border-stone-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] relative overflow-hidden group">
           {/* Canvas for Visualizer */}
           <canvas 
             ref={canvasRef} 
             width={280} 
             height={112} 
             className="w-full h-full opacity-90"
           />
           
           {/* Glass Reflection Overlay */}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
           
           {/* Pixel Grid Texture */}
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none"></div>

           {/* UI Overlay */}
           <div className="absolute top-2 left-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-stone-700'}`}></div>
              <span className={`font-mono text-[10px] ${isRecording ? 'text-red-500' : 'text-stone-600'}`}>
                {isRecording ? "REC [MIC ON]" : "STANDBY"}
              </span>
           </div>
           {!isRecording && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-mono text-xs text-stone-600 blink">PRESS REC</span>
             </div>
           )}
        </div>

        {/* Controls Section */}
        <div className="flex-1 flex flex-col justify-between pb-2">
          
          {/* Hardware Buttons Row */}
          <div className="flex justify-between items-center px-2">
             <button className="w-8 h-8 rounded bg-[#333] shadow-[0_2px_0_#111] active:shadow-none active:translate-y-[2px] border-t border-white/10 flex items-center justify-center">
                <Play size={12} className="text-stone-400 fill-stone-400" />
             </button>
             {/* The Main Record Button */}
             <button 
               onClick={toggleRecording}
               className={`
                 w-12 h-12 rounded-full border-4 border-[#E3E2DE] shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_2px_5px_rgba(0,0,0,0.2)]
                 flex items-center justify-center transition-all active:scale-95
                 ${isRecording ? 'bg-red-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]' : 'bg-[#d63a3a]'}
               `}
             >
                <div className="w-4 h-4 rounded-full bg-red-900/30"></div>
             </button>
             <button className="w-8 h-8 rounded bg-[#333] shadow-[0_2px_0_#111] active:shadow-none active:translate-y-[2px] border-t border-white/10 flex items-center justify-center">
                <div className="w-3 h-3 bg-stone-400 rounded-[1px]"></div>
             </button>
          </div>

          {/* Knobs Grid - Now with 3D physical look */}
          <div className="grid grid-cols-4 gap-2 mt-4">
             <HardwareKnob label="GAIN" propKey="gain" />
             <HardwareKnob label="TUNE" propKey="tune" />
             <HardwareKnob label="MIX" propKey="mix" />
             <HardwareKnob label="FX" propKey="fx" />
          </div>
        </div>

      </div>
    </Chassis>
  );
};

// --- Component 2: The Observer (Visual) ---
export const VisualWidget = () => {
  const [active, setActive] = useState(false);

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
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  // C Minor Scale (Ascending for the 16 steps)
  const frequencies = [
    130.81, 146.83, 155.56, 174.61, // C3, D3, Eb3, F3
    196.00, 207.65, 233.08, 261.63, // G3, Ab3, Bb3, C4
    293.66, 311.13, 349.23, 392.00, // D4, Eb4, F4, G4
    415.30, 466.16, 523.25, 587.33  // Ab4, Bb4, C5, D5
  ];

  const playNote = (index: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if suspended (common in mobile)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Smooth Sine Wave for Ambient feel
    osc.type = 'sine';
    osc.frequency.value = frequencies[index] || 440;
    
    // Envelope
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8); // Long Decay/Release for ambience
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.8);
  };

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

  // Effect to trigger sound on beat change
  useEffect(() => {
    if (playing && grid[beat]) {
      playNote(beat);
    }
  }, [beat, playing, grid]);

  const toggleCell = (i: number) => {
    const newGrid = [...grid];
    newGrid[i] = !newGrid[i];
    setGrid(newGrid);
    if (!newGrid[i]) {
      // If turning ON, play a preview note
      playNote(i);
    }
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
        w-[88vw] max-w-[320px] h-[480px] bg-[#4B8BF5] rounded-[40px] p-6 shadow-2xl flex flex-col relative
        transition-all duration-500 ease-out transform md:group-hover:rotate-x-2 md:group-hover:rotate-y-2
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
                onTouchStart={(e) => { e.preventDefault(); setIsTalking(true); }}
                onTouchEnd={() => setIsTalking(false)}
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
       <div className="text-center space-y-1 opacity-60 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
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
    const knobRef = useRef<HTMLDivElement>(null);

    const startInteraction = (clientX: number, clientY: number) => {
      const element = knobRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let lastAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

      const handleMove = (x: number, y: number) => {
        const currentAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        let delta = currentAngle - lastAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        lastAngle = currentAngle;

        setKnobValue(prev => Math.min(100, Math.max(0, prev + (delta * 0.5))));
      };

      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      };

      const stopInteraction = () => {
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopInteraction);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', stopInteraction);
      };

      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopInteraction);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', stopInteraction);
    };

    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <div 
          ref={knobRef}
          onMouseDown={(e) => { e.preventDefault(); startInteraction(e.clientX, e.clientY); }}
          onTouchStart={(e) => { startInteraction(e.touches[0].clientX, e.touches[0].clientY); }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-stone-800 to-black shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_2px_3px_rgba(255,255,255,0.1)] relative cursor-grab active:cursor-grabbing flex items-center justify-center border-4 border-[#2a2927] touch-none"
          style={{ transform: `rotate(${(knobValue / 100) * 270 - 135}deg)` }}
        >
          {/* Indicator Line */}
          <div className="absolute top-2 w-1 h-6 bg-white rounded-full shadow-[0_0_5px_white]"></div>
          {/* Grip Texture */}
          <div className="absolute inset-0 rounded-full border-[12px] border-dashed border-stone-800/50 opacity-40"></div>
        </div>
        <div className="text-xs font-mono text-stone-400 tracking-widest">{knobValue.toFixed(0)}%</div>
      </div>
    );
  };

  const Slider = () => {
    const handleStart = (clientX: number, target: HTMLElement) => {
        const rect = target.parentElement?.getBoundingClientRect();
        
        const update = (currentX: number) => {
            if(!rect) return;
            const x = currentX - rect.left;
            const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
            setSliderValue(pct);
        };

        const stop = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stop);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', stop);
            handleSubmit();
        };

        const onMouseMove = (e: MouseEvent) => update(e.clientX);
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            update(e.touches[0].clientX);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stop);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', stop);
        
        // Initial update
        update(clientX);
    };

    return (
      <div className="w-full px-4 flex flex-col items-center gap-4">
        <div className="w-full h-3 bg-[#d6d3d1] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] relative flex items-center">
          {/* Track Fill */}
          <div className="h-full bg-orange-900/10 rounded-l-full" style={{ width: `${sliderValue}%` }}></div>
          
          {/* Handle */}
          <div 
            className="absolute h-8 w-12 bg-gradient-to-b from-[#f5f5f4] to-[#e7e5e4] rounded border border-stone-400 shadow-[0_4px_6px_rgba(0,0,0,0.2),inset_0_1px_0_white] cursor-grab active:cursor-grabbing flex items-center justify-center gap-0.5 touch-none"
            style={{ left: `calc(${sliderValue}% - 24px)` }}
            onMouseDown={(e) => handleStart(e.clientX, e.currentTarget)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.currentTarget)}
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
  };

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
        w-[88vw] max-w-[320px] h-[340px] rounded-[32px] p-6 shadow-2xl flex flex-col relative overflow-hidden
        transition-all duration-500 ease-out transform md:group-hover:rotate-x-2 md:group-hover:rotate-y-2
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
      
      <div className="text-center space-y-1 opacity-60 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-900 font-bold">BR-5 // DIAL IN</h3>
        <div className="w-8 h-0.5 bg-stone-300 mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

// --- Component 6: The Tuner (Knob) ---
export const KnobWidget = () => {
  const [value, setValue] = useState(88.0);
  const [isOn, setIsOn] = useState(false);
  const [noise, setNoise] = useState(0);
  const [targetFreq] = useState(94.2); // Hidden sweet spot
  const [signalStrength, setSignalStrength] = useState(0);

  // Simulation loop for noise and signal
  useEffect(() => {
    if (!isOn) {
      setSignalStrength(0);
      return;
    }
    const interval = setInterval(() => {
      // Noise fluctuates randomly
      setNoise(Math.random() * 5);
      
      // Calculate signal based on distance to target
      const dist = Math.abs(value - targetFreq);
      const strength = Math.max(0, 100 - (dist * 40)); // Tight tuning range
      setSignalStrength(prev => strength > 80 ? strength + (Math.random() * 5) : strength); // jitter at high signal
      
    }, 100);
    return () => clearInterval(interval);
  }, [isOn, value, targetFreq]);

  // Circular drag for the main tuner
  const knobRef = useRef<HTMLDivElement>(null);

  const startInteraction = (clientX: number, clientY: number) => {
    const element = knobRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let lastAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

    const handleMove = (x: number, y: number) => {
      const currentAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      let delta = currentAngle - lastAngle;
      
      // Handle wrapping
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      lastAngle = currentAngle;
      
      setValue(v => {
        // Tuned for a weighted feel
        const next = v + (delta * 0.05);
        return Math.min(108, Math.max(88, next));
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const stopInteraction = () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopInteraction);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopInteraction);
    };

    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopInteraction);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stopInteraction);
  };

  const isTuned = signalStrength > 85;

  return (
    <Chassis label="KN-6 // Tuner" active={isOn && isTuned}>
      <div className="flex flex-col h-full gap-5 relative">
        
        {/* Top Display Panel */}
        <div className="h-24 bg-[#1a1917] rounded-lg border-2 border-[#D1D0CC] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] p-3 relative overflow-hidden flex flex-col justify-between">
            {/* LCD Screen */}
            <div className={`font-mono text-3xl tabular-nums tracking-widest text-right transition-colors duration-100 ${isOn ? (isTuned ? 'text-[#EAB308] drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'text-[#EAB308]/60') : 'text-[#2a2927]'}`}>
               {isOn ? value.toFixed(1) : '88.8'} <span className="text-xs">FM</span>
            </div>
            
            {/* Signal Meter Bar */}
            <div className="flex items-center gap-2">
               <span className="text-[8px] font-mono text-stone-500">SIGNAL</span>
               <div className="flex-1 h-1.5 bg-[#2a2927] rounded-sm overflow-hidden flex gap-0.5">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-[1px] transition-all duration-75 ${isOn && (signalStrength / 5) > i ? 'bg-green-500 shadow-[0_0_4px_green]' : 'bg-[#333]'}`} 
                    />
                  ))}
               </div>
            </div>

            {/* Stereo Indicator */}
            {isOn && isTuned && (
              <div className="absolute top-2 left-3 flex items-center gap-1 animate-pulse">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_4px_red]"></div>
                 <span className="text-[8px] font-mono text-red-500">STEREO</span>
              </div>
            )}
        </div>

        {/* The Main Knob */}
        <div className="flex-1 flex items-center justify-center relative">
            <div 
              ref={knobRef}
              onMouseDown={(e) => { e.preventDefault(); startInteraction(e.clientX, e.clientY); }}
              onTouchStart={(e) => { startInteraction(e.touches[0].clientX, e.touches[0].clientY); }}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-[#e5e5e5] to-[#a3a3a3] shadow-[0_10px_25px_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.2)] flex items-center justify-center relative cursor-grab active:cursor-grabbing group touch-none"
            >
               {/* Side Knurling Illusion */}
               <div className="absolute inset-0 rounded-full border-[10px] border-stone-300 border-dashed opacity-50"></div>
               
               {/* Top Face */}
               <div className="w-32 h-32 rounded-full bg-[conic-gradient(from_180deg,#f5f5f5,#e5e5e5,#d4d4d4,#e5e5e5,#f5f5f5)] shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center transform transition-transform duration-75"
                    style={{ transform: `rotate(${(value - 88) * 15}deg)` }}
               >
                  {/* Finger indentation */}
                  <div className="w-5 h-5 bg-stone-200 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] absolute top-4"></div>
                  {/* Center screw */}
                  <div className="w-2 h-2 bg-stone-400 rounded-full flex items-center justify-center"><div className="w-full h-px bg-stone-500"></div></div>
               </div>
            </div>
            
            {/* Frequency Scale Markings around knob */}
            <div className="absolute inset-0 pointer-events-none">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <div key={deg} className="absolute w-1 h-2 bg-stone-400/50" 
                       style={{ 
                         top: '50%', left: '50%', 
                         transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-90px)` 
                       }} 
                  />
                ))}
            </div>
        </div>

        {/* Bottom Switches */}
        <div className="h-16 flex items-center justify-between px-8 bg-[#d6d3d1]/20 rounded-xl">
           <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => setIsOn(!isOn)}
                className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${isOn ? 'bg-orange-500 justify-end' : 'bg-stone-400 justify-start'}`}
              >
                 <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
              </button>
              <span className="text-[8px] font-mono font-bold text-stone-500">POWER</span>
           </div>

           <div className="flex flex-col items-center gap-1 opacity-60">
             <div className="flex gap-2">
               <div className="w-1 h-4 bg-stone-400 rounded-sm"></div>
               <div className="w-1 h-4 bg-stone-800 rounded-sm"></div>
             </div>
             <span className="text-[8px] font-mono font-bold text-stone-500">AM/FM</span>
           </div>
        </div>

      </div>
    </Chassis>
  );
};