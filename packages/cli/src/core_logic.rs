// FILE: packages/cli/src/core_logic.rs
use crate::models::{Group, ProjectData};
use std::fs;
use std::path::{Path, PathBuf};
use sha2::{Digest, Sha256};
use tiktoken_rs::cl100k_base;
use ignore::WalkBuilder;
use uuid::Uuid;

fn get_project_file(project_path: &str) -> PathBuf {
    let mut hasher = Sha256::new();
    hasher.update(project_path.as_bytes());
    let hash = format!("{:x}", hasher.finalize());
    
    let config_dir = dirs::config_dir().unwrap().join("master-context-cli").join("projects");
    fs::create_dir_all(&config_dir).unwrap();
    config_dir.join(format!("{}.json", hash))
}

pub fn load_data(project_path: &str) -> ProjectData {
    let file = get_project_file(project_path);
    if file.exists() {
        let content = fs::read_to_string(file).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        ProjectData::default()
    }
}

pub fn save_data(project_path: &str, data: &ProjectData) {
    let file = get_project_file(project_path);
    let json = serde_json::to_string_pretty(data).unwrap();
    fs::write(file, json).unwrap();
}

pub fn calculate_tokens(project_path: &str, paths: &[String]) -> (usize, usize) {
    let bpe = cl100k_base().unwrap();
    let root = Path::new(project_path);
    let mut total_tokens = 0;
    let mut total_files = 0;

    for path_str in paths {
        let target_path = root.join(path_str);
        if !target_path.exists() { continue; }

        for result in WalkBuilder::new(&target_path).build().filter_map(Result::ok) {
            if result.metadata().map(|m| m.is_file()).unwrap_or(false) {
                if let Ok(content) = fs::read_to_string(result.path()) {
                    total_tokens += bpe.encode_with_special_tokens(&content).len();
                    total_files += 1;
                }
            }
        }
    }
    (total_tokens, total_files)
}

pub fn create_group(project_path: &str, name: String) -> Group {
    let mut data = load_data(project_path);
    let group = Group {
        id: Uuid::new_v4().to_string(),
        name,
        paths: vec![],
        total_tokens: 0,
        total_files: 0,
    };
    data.groups.push(group.clone());
    save_data(project_path, &data);
    group
}

pub fn delete_group(project_path: &str, group_id: &str) -> Result<(), String> {
    let mut data = load_data(project_path);
    let initial_len = data.groups.len();
    data.groups.retain(|g| g.id != group_id);
    if data.groups.len() == initial_len {
        return Err("Không tìm thấy Group ID".to_string());
    }
    save_data(project_path, &data);
    Ok(())
}

pub fn add_path(project_path: &str, group_id: &str, target_path: String) -> Result<Group, String> {
    let mut data = load_data(project_path);
    if let Some(group) = data.groups.iter_mut().find(|g| g.id == group_id) {
        if !group.paths.contains(&target_path) {
            group.paths.push(target_path);
        }
        let (tokens, files) = calculate_tokens(project_path, &group.paths);
        group.total_tokens = tokens;
        group.total_files = files;
        
        let updated = group.clone();
        save_data(project_path, &data);
        Ok(updated)
    } else {
        Err("Không tìm thấy Group".to_string())
    }
}

pub fn remove_path(project_path: &str, group_id: &str, target_path: String) -> Result<Group, String> {
    let mut data = load_data(project_path);
    if let Some(group) = data.groups.iter_mut().find(|g| g.id == group_id) {
        group.paths.retain(|p| p != &target_path);
        let (tokens, files) = calculate_tokens(project_path, &group.paths);
        group.total_tokens = tokens;
        group.total_files = files;

        let updated = group.clone();
        save_data(project_path, &data);
        Ok(updated)
    } else {
        Err("Không tìm thấy Group".to_string())
    }
}
