// CLI version - converted from Tauri
use crate::models::CachedProjectData;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use sha2::{Digest, Sha256};

// CLI: Lấy thư mục config (thay thế Tauri's AppHandle)
fn get_app_config_dir() -> Result<PathBuf, String> {
    let config_dir = dirs::config_dir()
        .ok_or_else(|| "Không thể xác định thư mục config".to_string())?
        .join("master-context-cli");
    
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Không thể tạo thư mục config: {}", e))?;
    
    Ok(config_dir)
}

// Lấy thư mục config cho project cụ thể
pub fn get_project_config_dir(project_path_str: &str) -> Result<PathBuf, String> {
    let app_config_dir = get_app_config_dir()?;

    // Băm đường dẫn project để tạo ID duy nhất
    let mut hasher = Sha256::new();
    hasher.update(project_path_str.as_bytes());
    let project_hash = hasher.finalize();
    let project_id = format!("{:x}", project_hash);

    let config_dir = app_config_dir.join("projects").join(project_id);

    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Không thể tạo thư mục cấu hình cho dự án: {}", e))?;
    
    Ok(config_dir)
}

// Lấy đường dẫn file config cho profile
pub fn get_project_config_path(
    project_path_str: &str,
    profile_name: &str,
) -> Result<PathBuf, String> {
    let config_dir = get_project_config_dir(project_path_str)?;
    
    // Sanitize profile name
    let sanitized_name: String = profile_name
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-')
        .collect();
    
    if sanitized_name.is_empty() {
        return Err("profile.invalid_name".to_string());
    }
    
    Ok(config_dir.join(format!("data_{}.json", sanitized_name)))
}

// Load project data từ file
pub fn load_project_data(path: &str, profile_name: &str) -> Result<CachedProjectData, String> {
    let config_path = get_project_config_path(path, profile_name)?;
    
    if !config_path.exists() {
        return Ok(CachedProjectData::default());
    }
    
    let mut file = File::open(config_path)
        .map_err(|e| format!("Không thể mở file dữ liệu dự án: {}", e))?;
    
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Không thể đọc file dữ liệu dự án: {}", e))?;
    
    if contents.is_empty() {
        return Ok(CachedProjectData::default());
    }
    
    serde_json::from_str(&contents)
        .map_err(|e| format!("Lỗi phân tích cú pháp JSON: {}", e))
}

// Save project data vào file
pub fn save_project_data(
    path: &str,
    profile_name: &str,
    data: &CachedProjectData,
) -> Result<(), String> {
    let config_path = get_project_config_path(path, profile_name)?;
    
    let json_string = serde_json::to_string_pretty(data)
        .map_err(|e| format!("Không thể serialize dữ liệu dự án: {}", e))?;
    
    let mut file = File::create(config_path)
        .map_err(|e| format!("Không thể tạo/ghi file dữ liệu dự án: {}", e))?;
    file.write_all(json_string.as_bytes())
        .map_err(|e| format!("Lỗi khi ghi file dữ liệu dự án: {}", e))?;
    Ok(())
}
