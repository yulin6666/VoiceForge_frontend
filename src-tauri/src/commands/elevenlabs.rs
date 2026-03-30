use base64::Engine;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Voice {
    pub voice_id: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
struct VoicesResponse {
    voices: Vec<Voice>,
}

/// 从 ElevenLabs 拉取可用声音列表
#[tauri::command]
pub async fn fetch_voices(api_key: String) -> Result<Vec<Voice>, String> {
    let client = Client::new();
    let response = client
        .get("https://api.elevenlabs.io/v1/voices")
        .header("xi-api-key", &api_key)
        .send()
        .await
        .map_err(|e| format!("网络错误: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("API 错误 {}: {}", status, body));
    }

    let data: VoicesResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    Ok(data.voices)
}

/// 试听：生成单句音频，返回 base64 编码的 MP3
#[tauri::command]
pub async fn preview_voice(
    api_key: String,
    voice_id: String,
    text: String,
) -> Result<String, String> {
    let bytes = tts_request(&api_key, &voice_id, &text, "mp3_44100_128").await?;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(encoded)
}

/// 内部通用 TTS 请求
/// output_format: "mp3_44100_128" | "ogg_vorbis_44100"
pub async fn tts_request(
    api_key: &str,
    voice_id: &str,
    text: &str,
    output_format: &str,
) -> Result<Vec<u8>, String> {
    let client = Client::new();

    let body = serde_json::json!({
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    });

    let response = client
        .post(format!(
            "https://api.elevenlabs.io/v1/text-to-speech/{}",
            voice_id
        ))
        .header("xi-api-key", api_key)
        .header("Content-Type", "application/json")
        .query(&[("output_format", output_format)])
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("网络错误: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let err_text = response.text().await.unwrap_or_default();
        eprintln!("[elevenlabs] TTS failed: status={} body={}", status, err_text);
        return Err(format!("API 错误 {}: {}", status, err_text));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("读取响应失败: {}", e))?;

    Ok(bytes.to_vec())
}
