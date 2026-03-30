import { useStore } from "../store";

export function DialoguePreview() {
  const { dialogueLines, selectedCharacter } = useStore();

  const filtered =
    selectedCharacter === null
      ? dialogueLines
      : dialogueLines.filter((l) => l.character === selectedCharacter);

  if (dialogueLines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        <div className="text-center">
          <p className="text-4xl mb-3">🎙️</p>
          <p>Click "Import dialogue.tab" to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-700">
          <tr className="text-left">
            <th className="px-4 py-2 text-xs text-zinc-400 font-medium w-[200px]">ID</th>
            <th className="px-4 py-2 text-xs text-zinc-400 font-medium w-[100px]">Character</th>
            <th className="px-4 py-2 text-xs text-zinc-400 font-medium">Dialogue</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((line, idx) => (
            <tr
              key={line.id}
              className={idx % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/50"}
            >
              <td className="px-4 py-2 font-mono text-xs text-zinc-500 truncate max-w-[200px]">
                {line.id}
              </td>
              <td className="px-4 py-2 text-violet-400 text-xs truncate">{line.character}</td>
              <td className="px-4 py-2 text-zinc-200">{line.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
