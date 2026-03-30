import { Settings2 } from "lucide-react";
import { useStore } from "./store";
import { CharacterList } from "./components/CharacterList";
import { DialoguePreview } from "./components/DialoguePreview";
import { VoiceAssignment } from "./components/VoiceAssignment";
import { GenerationPanel } from "./components/GenerationPanel";
import { Settings } from "./components/Settings";

function App() {
  const { showSettings, setShowSettings } = useStore();

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100 select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-700 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 font-bold text-base">VoiceForge</span>
          <span className="text-zinc-500 text-sm">for Ren'Py</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded"
        >
          <Settings2 size={15} />
          Settings
        </button>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: character list */}
        <div className="w-48 shrink-0 border-r border-zinc-700 bg-zinc-800/30 flex flex-col">
          <CharacterList />
        </div>

        {/* Right: dialogue preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          <DialoguePreview />
        </div>
      </div>

      {/* Voice assignment panel */}
      <VoiceAssignment />

      {/* Generation panel */}
      <GenerationPanel />

      {/* Settings modal */}
      {showSettings && <Settings />}
    </div>
  );
}

export default App;
