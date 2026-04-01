import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, Zap, FolderOutput } from "lucide-react";
import { useStore } from "../store";
import { ProgressEvent } from "../types";

export function GenerationPanel() {
  const {
    apiKey,
    dialogueLines,
    voiceAssignments,
    outputDir,
    setOutputDir,
    isGenerating,
    setIsGenerating,
    progress,
    setProgress,
  } = useStore();

  const unlistenRef = useRef<UnlistenFn | null>(null);

  // 清理事件监听
  useEffect(() => {
    return () => {
      unlistenRef.current?.();
    };
  }, []);

  async function selectOutputDir() {
    const dir = await open({
      title: "Select audio output directory",
      directory: true,
      multiple: false,
    });
    if (dir) setOutputDir(dir as string);
  }

  async function handleGenerate() {
    if (!apiKey) {
      alert("Please enter ElevenLabs API Key in Settings first");
      return;
    }
    if (!outputDir) {
      alert("Please select output directory first");
      return;
    }
    const unassigned = [...new Set(dialogueLines.map((l) => l.character))].filter(
      (c) => !voiceAssignments[c]
    );
    if (unassigned.length > 0) {
      alert(`Unassigned characters: ${unassigned.join(", ")}`);
      return;
    }

    setIsGenerating(true);
    setProgress({ completed: 0, total: dialogueLines.length, errors: [] });

    // 订阅进度事件
    const errors: string[] = [];
    unlistenRef.current = await listen<ProgressEvent>("generation-progress", (evt) => {
      const { completed, total, error } = evt.payload;
      if (error) errors.push(error);
      setProgress({ completed, total, errors: [...errors] });
    });

    try {
      await invoke("generate_all", {
        apiKey,
        lines: dialogueLines,
        voiceAssignments,
        outputDir,
      });
    } catch (e) {
      alert("Generation failed: " + String(e));
    } finally {
      unlistenRef.current?.();
      unlistenRef.current = null;
      setIsGenerating(false);
    }
  }

  async function handleOpenDir() {
    if (outputDir) {
      await invoke("open_output_directory", { path: outputDir });
    }
  }

  const { completed, total, errors } = progress;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const done = !isGenerating && total > 0 && completed === total;

  return (
    <div className="border-t border-zinc-700 px-4 py-3 bg-zinc-900">
      <div className="flex items-center gap-3">
        {/* Output directory selection */}
        <button
          onClick={selectOutputDir}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 rounded text-zinc-200"
        >
          <FolderOpen size={14} />
          {outputDir ? (
            <span className="max-w-[200px] truncate text-xs">{outputDir}</span>
          ) : (
            "Select Output Directory"
          )}
        </button>

        {/* Start generation */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || dialogueLines.length === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-white font-medium"
        >
          <Zap size={14} />
          {isGenerating ? "Generating..." : "Start Generation"}
        </button>

        {/* Progress */}
        <div className="flex-1">
          {(isGenerating || done) && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs text-zinc-300 whitespace-nowrap">
                {completed} / {total} lines
              </span>
            </div>
          )}
          {!isGenerating && total === 0 && dialogueLines.length > 0 && (
            <span className="text-xs text-zinc-500">{dialogueLines.length} lines to generate</span>
          )}
          {errors.length > 0 && (
            <p className="text-xs text-red-400 mt-0.5">{errors.length} failed</p>
          )}
        </div>

        {/* Open directory after completion */}
        {done && (
          <button
            onClick={handleOpenDir}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-700 hover:bg-green-600 rounded text-white"
          >
            <FolderOutput size={14} />
            Open Directory
          </button>
        )}
      </div>

      {/* Completion message */}
      {done && (
        <p className="text-xs text-zinc-400 mt-2">
          ✅ Generation complete! Place the <code className="text-violet-400">voice/</code> directory in game/ and add to{" "}
          <code className="text-violet-400">options.rpy</code>:
          <code className="ml-1 text-green-400">config.auto_voice = "voice/&#123;id&#125;.mp3"</code>
        </p>
      )}
    </div>
  );
}
