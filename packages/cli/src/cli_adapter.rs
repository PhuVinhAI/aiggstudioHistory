// CLI adapter - thay thế Tauri-specific code
use std::path::PathBuf;
use dirs;

/// Lấy thư mục config cho CLI (thay thế Tauri's app_config_dir)
pub fn get_app_config_dir() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Không thể xác định thư mục config".to_string())?
        .join("master-context-cli");
    
    std::fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Không thể tạo thư mục config: {}", e))?;
    
    Ok(config_dir)
}

/// Progress callback cho CLI (thay thế Tauri's Window.emit)
pub struct CliProgress {
    pub show_progress: bool,
}

impl CliProgress {
    pub fn new(show_progress: bool) -> Self {
        Self { show_progress }
    }
    
    pub fn emit(&self, event: &str, data: impl std::fmt::Display) {
        if self.show_progress {
            println!("[{}] {}", event, data);
        }
    }
    
    pub fn emit_json(&self, event: &str, data: &impl serde::Serialize) {
        if self.show_progress {
            if let Ok(json) = serde_json::to_string_pretty(data) {
                println!("[{}] {}", event, json);
            }
        }
    }
}
