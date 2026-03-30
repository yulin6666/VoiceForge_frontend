use std::collections::HashMap;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

use crate::commands::elevenlabs::tts_request;
use crate::commands::parse::DialogueLine;

#[derive(serde::Serialize, Clone)]
pub struct ProgressEvent {
    pub completed: usize,
    pub total: usize,
    pub current_id: String,
    pub error: Option<String>,
}

/// 批量生成所有台词音频
/// - 跳过已存在文件（断点续传）
/// - 失败自动重试 3 次
/// - 通过 "generation-progress" 事件推送进度
#[tauri::command]
pub async fn generate_all(
    app: AppHandle,
    api_key: String,
    lines: Vec<DialogueLine>,
    voice_assignments: HashMap<String, String>, // character -> voice_id
    output_dir: String,
) -> Result<(), String> {
    let output_path = PathBuf::from(&output_dir);
    std::fs::create_dir_all(&output_path)
        .map_err(|e| format!("无法创建输出目录: {}", e))?;

    let total = lines.len();

    for (i, line) in lines.iter().enumerate() {
        let output_file = output_path.join(format!("{}.mp3", line.id));

        // 断点续传：已存在则跳过
        if output_file.exists() {
            app.emit(
                "generation-progress",
                ProgressEvent {
                    completed: i + 1,
                    total,
                    current_id: line.id.clone(),
                    error: None,
                },
            )
            .ok();
            continue;
        }

        let voice_id = match voice_assignments.get(&line.character) {
            Some(v) => v.clone(),
            None => {
                app.emit(
                    "generation-progress",
                    ProgressEvent {
                        completed: i + 1,
                        total,
                        current_id: line.id.clone(),
                        error: Some(format!("角色 '{}' 未分配声音", line.character)),
                    },
                )
                .ok();
                continue;
            }
        };

        // 重试 3 次
        let mut last_error: Option<String> = None;
        for attempt in 0..3u32 {
            eprintln!("[generate] [{}/{}] id={} attempt={}", i + 1, total, line.id, attempt + 1);
            match tts_request(&api_key, &voice_id, &line.text, "mp3_44100_128").await {
                Ok(bytes) => {
                    eprintln!("[generate] OK {} bytes -> {:?}", bytes.len(), output_file);
                    std::fs::write(&output_file, &bytes)
                        .map_err(|e| format!("写文件失败: {}", e))?;
                    last_error = None;
                    break;
                }
                Err(e) => {
                    eprintln!("[generate] ERROR id={} attempt={}: {}", line.id, attempt + 1, e);
                    last_error = Some(e);
                    if attempt < 2 {
                        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
                    }
                }
            }
        }

        app.emit(
            "generation-progress",
            ProgressEvent {
                completed: i + 1,
                total,
                current_id: line.id.clone(),
                error: last_error,
            },
        )
        .ok();
    }

    Ok(())
}

/// 在 Finder/Explorer 打开输出目录
#[tauri::command]
pub async fn open_output_directory(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}
