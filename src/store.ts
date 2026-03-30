import { create } from "zustand";
import { DialogueLine, Voice } from "./types";

interface VoiceForgeState {
  // API Key
  apiKey: string;
  setApiKey: (key: string) => void;

  // Dialogue data
  dialogueLines: DialogueLine[];
  setDialogueLines: (lines: DialogueLine[]) => void;

  // Derived: unique characters
  characters: string[];

  // Available voices from ElevenLabs
  availableVoices: Voice[];
  setAvailableVoices: (voices: Voice[]) => void;

  // Character -> voice_id mapping
  voiceAssignments: Record<string, string>;
  setVoiceAssignment: (character: string, voiceId: string) => void;

  // Currently selected character (filters dialogue preview)
  selectedCharacter: string | null;
  setSelectedCharacter: (character: string | null) => void;

  // Output directory
  outputDir: string;
  setOutputDir: (dir: string) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  progress: { completed: number; total: number; errors: string[] };
  setProgress: (p: { completed: number; total: number; errors: string[] }) => void;

  // Settings panel
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
}

const STORAGE_KEY_API = "voiceforge_api_key";

export const useStore = create<VoiceForgeState>((set) => ({
  apiKey: localStorage.getItem(STORAGE_KEY_API) ?? "",
  setApiKey: (key) => {
    localStorage.setItem(STORAGE_KEY_API, key);
    set({ apiKey: key });
  },

  dialogueLines: [],
  setDialogueLines: (lines) => {
    const characters = [...new Set(lines.map((l) => l.character))];
    set({ dialogueLines: lines, characters, selectedCharacter: null });
  },

  characters: [],

  availableVoices: [],
  setAvailableVoices: (voices) => set({ availableVoices: voices }),

  voiceAssignments: {},
  setVoiceAssignment: (character, voiceId) =>
    set((state) => ({
      voiceAssignments: { ...state.voiceAssignments, [character]: voiceId },
    })),

  selectedCharacter: null,
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),

  outputDir: "",
  setOutputDir: (dir) => set({ outputDir: dir }),

  isGenerating: false,
  setIsGenerating: (v) => set({ isGenerating: v }),

  progress: { completed: 0, total: 0, errors: [] },
  setProgress: (p) => set({ progress: p }),

  showSettings: false,
  setShowSettings: (v) => set({ showSettings: v }),
}));
