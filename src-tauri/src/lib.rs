mod commands;
use commands::{elevenlabs, generate, parse};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            parse::parse_dialogue_tab,
            elevenlabs::fetch_voices,
            elevenlabs::preview_voice,
            generate::generate_all,
            generate::open_output_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
