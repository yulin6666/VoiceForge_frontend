import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Play, Loader2 } from "lucide-react";
import { useStore } from "../store";

export function VoiceAssignment() {
  const { characters, availableVoices, voiceAssignments, setVoiceAssignment, apiKey } =
    useStore();
  const [previewingChar, setPreviewingChar] = useState<string | null>(null);

  async function handlePreview(character: string) {
    const voiceId = voiceAssignments[character];
    if (!voiceId || !apiKey) return;

    // 找一条该角色的台词用于试听
    const { dialogueLines } = useStore.getState();
    const sample = dialogueLines.find((l) => l.character === character);
    if (!sample) return;

    setPreviewingChar(character);
    try {
      const base64 = await invoke<string>("preview_voice", {
        apiKey,
        voiceId,
        text: sample.text,
      });
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
      audio.play();
    } catch (e) {
      alert("Preview failed: " + String(e));
    } finally {
      setPreviewingChar(null);
    }
  }

  if (characters.length === 0) return null;

  return (
    <div className="border-t border-zinc-700 px-4 py-3 bg-zinc-800/50">
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Voice Assignment</p>

      {availableVoices.length === 0 && (
        <p className="text-xs text-zinc-500 mb-2">
          Please enter API Key in Settings to load voice list
        </p>
      )}

      <div className="grid grid-cols-1 gap-1.5">
        {characters.map((char) => (
          <div key={char} className="flex items-center gap-3">
            <span className="text-sm text-zinc-300 w-28 truncate">{char}</span>
            <span className="text-zinc-600">→</span>

            <select
              value={voiceAssignments[char] ?? ""}
              onChange={(e) => setVoiceAssignment(char, e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
            >
              <option value="">-- Select Voice --</option>
              {availableVoices.map((v) => (
                <option key={v.voice_id} value={v.voice_id}>
                  {v.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => handlePreview(char)}
              disabled={!voiceAssignments[char] || previewingChar === char}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed rounded text-zinc-200"
            >
              {previewingChar === char ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Play size={12} />
              )}
              Preview
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
