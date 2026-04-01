import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Upload, User } from "lucide-react";
import { useStore } from "../store";
import { DialogueLine } from "../types";
import { cn } from "../lib/utils";

export function CharacterList() {
  const {
    characters,
    selectedCharacter,
    setSelectedCharacter,
    setDialogueLines,
    dialogueLines,
  } = useStore();

  async function handleImport() {
    const filePath = await open({
      title: "Select dialogue.tab file",
      filters: [{ name: "Tab-delimited files", extensions: ["tab", "tsv", "txt"] }],
      multiple: false,
      directory: false,
    });

    if (!filePath) return;

    try {
      const lines = await invoke<DialogueLine[]>("parse_dialogue_tab", {
        filePath: filePath as string,
      });
      setDialogueLines(lines);
    } catch (e) {
      alert("Parse failed: " + String(e));
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-zinc-700">
        <p className="text-xs text-zinc-400 uppercase tracking-wide">Characters</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {characters.length === 0 ? (
          <div className="p-4 text-xs text-zinc-500 text-center">
            Import dialogue.tab to see<br />characters here
          </div>
        ) : (
          <>
            <button
              onClick={() => setSelectedCharacter(null)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700/50",
                selectedCharacter === null
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-300"
              )}
            >
              <User size={14} className="text-zinc-400" />
              <span>All</span>
              <span className="ml-auto text-xs text-zinc-500">{dialogueLines.length}</span>
            </button>

            {characters.map((char) => {
              const count = dialogueLines.filter((l) => l.character === char).length;
              return (
                <button
                  key={char}
                  onClick={() => setSelectedCharacter(char)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-700/50",
                    selectedCharacter === char
                      ? "bg-zinc-700 text-zinc-100"
                      : "text-zinc-300"
                  )}
                >
                  <User size={14} className="text-violet-400" />
                  <span className="truncate">{char}</span>
                  <span className="ml-auto text-xs text-zinc-500">{count}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="p-3 border-t border-zinc-700">
        <button
          onClick={handleImport}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-200"
        >
          <Upload size={14} />
          Import dialogue.tab
        </button>
      </div>
    </div>
  );
}
