import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronLeft, MoreHorizontal, Trash2, Cloud, Zap, Settings, X, Edit2, Check } from 'lucide-react';
import { Note, ReflectionState } from '../types';

interface PhoneSimulatorProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onClearNotes: () => void;
  reflectionState: ReflectionState;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ 
  notes, 
  onAddNote, 
  onUpdateNote,
  onDeleteNote,
  onClearNotes,
  reflectionState 
}) => {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const handleAdd = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setShowSettings(false);
  };

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      onUpdateNote(editingId, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  // Auto-resize textarea logic could go here, but simple fixed/scroll works for now.
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      // adjust height if needed
      editInputRef.current.style.height = 'auto';
      editInputRef.current.style.height = editInputRef.current.scrollHeight + 'px';
    }
  }, [editingId]);

  useEffect(() => {
    if (!editingId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes, editingId]);

  return (
    <div className="relative h-[800px] w-[390px] bg-stone-900 rounded-[50px] p-3 shadow-2xl ring-1 ring-white/10">
      {/* Phone Frame Content */}
      <div className="h-full w-full bg-paper rounded-[40px] overflow-hidden flex flex-col relative">
        
        {/* Status Bar Mock */}
        <div className="h-12 w-full flex items-center justify-between px-6 pt-2 select-none z-30">
          <span className="text-xs font-semibold text-stone-800">9:41</span>
          <div className="flex gap-2 items-center">
             {reflectionState.isThinking && (
               <span className="animate-pulse text-[10px] text-stone-400 font-medium">Reflecting...</span>
             )}
            <div className="flex gap-1.5">
              <div className="w-4 h-2.5 bg-stone-800 rounded-[1px]"></div>
              <div className="w-0.5 h-2.5 bg-stone-800 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* App Header */}
        <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-stone-100/50 relative z-20">
          <div className="flex items-center gap-2 text-stone-500">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Folders</span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <MoreHorizontal size={20} className="text-stone-400" />
          </button>

          {/* Settings Menu Dropdown */}
          {showSettings && (
            <div className="absolute right-4 top-12 w-48 bg-white rounded-xl shadow-xl border border-stone-100 py-2 animate-fade-in-up origin-top-right z-50">
              <div className="px-4 py-2 text-xs font-semibold text-stone-400 uppercase tracking-widest border-b border-stone-50 mb-1">
                Settings
              </div>
              <button 
                onClick={() => { onClearNotes(); setShowSettings(false); }}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Clear All Notes
              </button>
              <div className="px-4 py-2 text-[10px] text-stone-300 text-center">
                v1.0.4 • Compass
              </div>
            </div>
          )}
        </div>

        {/* Overlay when settings are open */}
        {showSettings && (
          <div className="absolute inset-0 z-10" onClick={() => setShowSettings(false)}></div>
        )}

        {/* Title */}
        <div className="px-6 py-4">
          <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">Confusion</h1>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-sans flex items-center gap-2">
            {notes.length} Notes • Auto-Sync
            {reflectionState.isThinking ? <Zap size={10} className="text-amber-500 animate-pulse" /> : <Cloud size={10} />}
          </p>
        </div>

        {/* Notes List / Feed */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar space-y-6">
          {notes.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <span className="text-4xl mb-4">🌫️</span>
              <p className="font-serif italic">The fog is clearing.<br/>Write to cloud it again.</p>
            </div>
          )}

          {notes.map((note) => (
            <div key={note.id} className="group relative animate-fade-in-up">
              {editingId === note.id ? (
                <div className="relative">
                  <textarea
                    ref={editInputRef}
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="w-full bg-stone-50 p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-200 font-serif text-lg leading-relaxed text-ink resize-none overflow-hidden"
                    rows={1}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={cancelEdit} className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500">
                      <X size={14} />
                    </button>
                    <button onClick={saveEdit} className="p-1.5 rounded-full bg-stone-900 text-white hover:bg-stone-700">
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => startEditing(note)} className="cursor-pointer">
                  <p className="text-ink font-serif text-lg leading-relaxed whitespace-pre-wrap hover:text-stone-600 transition-colors">
                    {note.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-sans">
                      {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button 
                        onClick={(e) => { e.stopPropagation(); startEditing(note); }}
                        className="text-stone-300 hover:text-stone-500"
                       >
                         <Edit2 size={12} />
                       </button>
                       <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                        className="text-stone-300 hover:text-red-400"
                       >
                         <Trash2 size={12} />
                       </button>
                    </div>
                  </div>
                  <div className="h-px w-12 bg-stone-200 mt-6 mb-2"></div>
                </div>
              )}
            </div>
          ))}
           
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-paper via-paper to-transparent pb-8 pt-6 px-6 z-20">
          <div className="flex items-end gap-3">
             <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-stone-100 focus-within:ring-2 focus-within:ring-stone-200 transition-all">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a thought..."
                  className="w-full bg-transparent p-4 min-h-[50px] max-h-[120px] resize-none outline-none text-ink font-serif text-base placeholder:text-stone-300 placeholder:italic rounded-2xl hide-scrollbar"
                  rows={1}
                />
             </div>
             
             <button 
              onClick={handleAdd}
              disabled={!newNote.trim()}
              className="h-[50px] w-[50px] flex items-center justify-center bg-stone-900 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
             >
               <Plus size={24} />
             </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-stone-300 font-medium">Companion is listening</span>
          </div>
        </div>
      </div>
    </div>
  );
};