# VoiceForge for Ren'Py

AI batch voice generation tool designed for Ren'Py visual novel developers.

## Features

- Parse Ren'Py exported `dialogue.tab` files
- Automatically group dialogues by character
- Batch generate voices using ElevenLabs API
- Preview individual lines
- Resume from interruption with auto-retry on failure
- Export audio files ready for Ren'Py

## Usage

### 1. Export Dialogue from Ren'Py Launcher

Open your Ren'Py project:
```
Ren'Py Launcher → Extract Dialogue → Tab-delimited Spreadsheet
```

This generates a `dialogue.tab` file.

### 2. Launch VoiceForge

Development mode:
```bash
cd VoiceForge_frontend
npm run tauri dev
```

### 3. Configure API Key

Click "Settings" in the top right corner and enter your ElevenLabs API Key.

### 4. Import Project

Click "Import dialogue.tab" in the bottom left and select the exported file.

### 5. Assign Voices

In the "Voice Assignment" section at the bottom, select an ElevenLabs voice for each character. Click "Preview" to test.

### 6. Generate Audio

- Click "Select Output Directory" to choose save location
- Click "Start Generation" and wait for batch generation to complete
- Click "Open Directory" when finished to view results

### 7. Integrate with Ren'Py

Place the generated `voice/` directory into your Ren'Py project's `game/` directory, then add to `options.rpy`:

```python
config.auto_voice = "voice/{id}.ogg"
```

Done! Run your game to hear the voices.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Zustand
- **Desktop Framework**: Tauri v2
- **Backend**: Rust
- **TTS**: ElevenLabs API

## Development

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run tauri dev
```

Build production version:
```bash
npm run tauri build
```

## Notes

- API Key is stored locally only and never uploaded
- Generated audio is in OGG Vorbis format (natively supported by Ren'Py)
- Failed lines will auto-retry 3 times
- Already generated files will be skipped (resume support)
