export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  audioUrl?: string; // Optional URL for playback
}

export type ReflectionType = 'question' | 'quote' | 'image';
export type WidgetSize = 'seed' | 'bridge' | 'pillar' | 'monolith';

export interface ReflectionItem {
  id: string;
  type: ReflectionType;
  content: string; 
  author?: string;
  widgetSize: WidgetSize;
  intensity: 1 | 2 | 3; // 1: subtle, 2: medium, 3: heavy/commanding
  timestamp: Date;
}

export interface ReflectionState {
  isThinking: boolean;
  history: ReflectionItem[];
  currentIndex: number;
}