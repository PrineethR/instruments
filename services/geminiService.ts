import { GoogleGenAI, Type } from "@google/genai";
import { Note, ReflectionItem, WidgetSize } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
};

export const processAudioNote = async (audioBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: audioBase64
            }
          },
          {
            text: "Listen to this audio note deeply. Transcribe it, but capture the emotional tone in brackets if it's distinct (e.g. [sighs], [long pause]). If it's silent, say [Silence]."
          }
        ]
      }
    });
    return response.text || "[Unintelligible]";
  } catch (error) {
    console.error("Audio processing error:", error);
    return "Could not process audio note.";
  }
};

export const generateReflection = async (notes: Note[]): Promise<ReflectionItem> => {
  const notesText = notes.map(n => `- ${n.content}`).join("\n");
  const hasNotes = notes.length > 0;
  const timeOfDay = getTimeOfDay();

  const prompt = `
    I have a user's personal notes. They are:
    ${hasNotes ? notesText : "Empty. The user hasn't written anything yet."}

    The current time is ${timeOfDay}. 
    
    Act as a soulful, artistic companion. Analyze the "confusion" and emotional depth.
    Decide whether to offer:
    1. A generic, philosophical question (type: 'question'). 
    2. A relevant quote from literature or philosophy (type: 'quote').
    3. An impressionist visual description (type: 'image_prompt').

    Assign an 'intensity' ("1", "2", or "3") based on how heavy or profound the notes feel.
    Return JSON.
  `;

  try {
    const planResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["question", "quote", "image_prompt"] },
            content: { type: Type.STRING, description: "The content text." },
            author: { type: Type.STRING, description: "Author if quote." },
            intensity: { type: Type.STRING, enum: ["1", "2", "3"] }
          },
          required: ["type", "content", "intensity"]
        }
      }
    });

    const plan = JSON.parse(planResponse.text || "{}");
    const intensity = parseInt(plan.intensity) as 1 | 2 | 3;
    
    // Complex Sizing Logic
    let size: WidgetSize = 'seed';
    
    if (plan.type === 'image_prompt') {
      size = 'monolith'; // Images always take full space
    } else {
      if (timeOfDay === 'night' || intensity === 3) {
        size = 'monolith';
      } else if (plan.type === 'quote' || timeOfDay === 'afternoon') {
        size = 'bridge';
      } else if (plan.content.length > 100) {
        size = 'pillar';
      } else {
        size = 'seed';
      }
    }

    if (plan.type === 'image_prompt') {
      return await generateImageReflection(plan.content, intensity);
    }

    return {
      id: crypto.randomUUID(),
      type: plan.type as 'question' | 'quote',
      content: plan.content,
      author: plan.author,
      widgetSize: size,
      intensity,
      timestamp: new Date()
    };

  } catch (error) {
    console.error("Error generating reflection:", error);
    return {
      id: crypto.randomUUID(),
      type: 'question',
      content: "What is moving beneath the surface?",
      widgetSize: 'seed',
      intensity: 1,
      timestamp: new Date()
    };
  }
};

const generateImageReflection = async (prompt: string, intensity: 1 | 2 | 3): Promise<ReflectionItem> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Oil painting, impressionist style, emotionally resonant, intensity level ${intensity}: ${prompt}` }]
      }
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return {
      id: crypto.randomUUID(),
      type: 'image',
      content: imageUrl || "",
      widgetSize: 'monolith',
      intensity,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      id: crypto.randomUUID(),
      type: 'question',
      content: "The image is still forming. What do you see?",
      widgetSize: 'seed',
      intensity: 1,
      timestamp: new Date()
    };
  }
};