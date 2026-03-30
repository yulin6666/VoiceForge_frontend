# VoiceForge Usage Guide

## Quick Start

### Step 1: Export Ren'Py Dialogue

1. Open Ren'Py Launcher
2. Select your project
3. Click `Extract Dialogue`
4. Select `Tab-delimited Spreadsheet`
5. A `dialogue.tab` file will be generated in the project directory

### Step 2: Launch VoiceForge

```bash
cd VoiceForge_frontend
npm run tauri dev
```

The application will open automatically.

### Step 3: Configure ElevenLabs API Key

1. Click the "Settings" button in the top right corner
2. Enter your ElevenLabs API Key (get it from https://elevenlabs.io)
3. Click "Save & Verify"
4. The system will automatically fetch available voices

### Step 4: Import Dialogue File

1. Click "Import dialogue.tab" in the bottom left
2. Select the `dialogue.tab` file you just exported
3. All characters and dialogues will be displayed automatically

### Step 5: Assign Voices

In the "Voice Assignment" section at the bottom:
- Select an ElevenLabs voice for each character
- Click "Preview" button to test the voice
- You can change voices and preview again anytime

### Step 6: Batch Generate

1. Click "Select Output Directory" to choose save location
2. Click "Start Generation"
3. Wait for the progress bar to complete (supports resume)
4. Click "Open Directory" when finished to view generated audio

### Step 7: Integrate with Ren'Py

1. Place all generated `.mp3` files into `game/voice/` directory
2. Add this line to `game/options.rpy`:

```python
config.auto_voice = "voice/{id}.mp3"
```

3. Run your game and voices will play automatically!

## FAQ

**Q: Is the API Key safe?**
A: API Key is stored in local localStorage only and never uploaded to any server.

**Q: What if generation fails?**
A: The system will auto-retry 3 times. If it still fails, check your network and API Key quota.

**Q: Can I resume from interruption?**
A: Yes. Already generated files will be skipped and generation continues from where it left off.

**Q: What languages are supported?**
A: ElevenLabs supports multiple languages including Chinese, English, Japanese, etc.

**Q: What audio format is used?**
A: MP3 44.1kHz 128kbps, natively supported by Ren'Py.

## Development

### Project Structure

```
VoiceForge_frontend/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── store.ts           # Zustand state management
│   ├── types.ts           # TypeScript types
│   └── App.tsx            # Main application
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands/      # Tauri commands
│   │   │   ├── parse.rs   # Parse dialogue.tab
│   │   │   ├── elevenlabs.rs  # ElevenLabs API
│   │   │   └── generate.rs    # Batch generation
│   │   └── lib.rs
│   └── Cargo.toml
└── package.json
```

### Build Production Version

```bash
npm run tauri build
```

Installers will be generated in `src-tauri/target/release/bundle/`.

## Support

Please open an issue if you encounter any problems.
