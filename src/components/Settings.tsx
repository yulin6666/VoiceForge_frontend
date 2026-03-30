import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X } from "lucide-react";
import { useStore } from "../store";
import { Voice } from "../types";

export function Settings() {
  const { apiKey, setApiKey, setAvailableVoices, setShowSettings } = useStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!inputKey.trim()) return;
    setLoading(true);
    setError("");
    try {
      const voices = await invoke<Voice[]>("fetch_voices", { apiKey: inputKey.trim() });
      setApiKey(inputKey.trim());
      setAvailableVoices(voices);
      setShowSettings(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 border border-zinc-600 rounded-lg p-6 w-[480px] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block text-sm text-zinc-300 mb-1">ElevenLabs API Key</label>
        <input
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />

        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}

        <p className="text-zinc-500 text-xs mt-2">
          API Key is stored locally only and never uploaded to any server.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => setShowSettings(false)}
            className="px-4 py-1.5 text-sm text-zinc-300 hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !inputKey.trim()}
            className="px-4 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white"
          >
            {loading ? "Verifying..." : "Save & Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
