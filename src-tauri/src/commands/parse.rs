use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DialogueLine {
    pub id: String,
    pub character: String,
    pub text: String,
}

/// 解析 dialogue.tab 文件
/// 格式：Identifier \t Character \t Dialogue \t ... (更多列忽略)
/// 角色名为空时标记为 "narrator"
#[tauri::command]
pub fn parse_dialogue_tab(file_path: String) -> Result<Vec<DialogueLine>, String> {
    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("无法读取文件: {}", e))?;

    let mut lines = Vec::new();

    for line in content.lines() {
        if line.trim().is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.splitn(4, '\t').collect();
        if parts.len() < 3 {
            continue;
        }

        // 跳过表头
        if parts[0].trim() == "Identifier" {
            continue;
        }

        let character = if parts[1].trim().is_empty() {
            "narrator".to_string()
        } else {
            parts[1].trim().to_string()
        };

        lines.push(DialogueLine {
            id: parts[0].trim().to_string(),
            character,
            text: parts[2].trim().to_string(),
        });
    }

    Ok(lines)
}
