// CLI version - converted from Tauri
use crate::{file_cache, models};
use std::fs;

pub fn list_profiles(project_path: &str) -> Result<Vec<String>, String> {
    let config_dir = file_cache::get_project_config_dir(project_path)?;

    let mut profiles = Vec::new();
    if config_dir.exists() {
        for entry in fs::read_dir(config_dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.is_file() {
                if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
                    if filename.starts_with("data_") && filename.ends_with(".json") {
                        let profile_name = &filename[5..filename.len() - 5];
                        profiles.push(profile_name.to_string());
                    }
                }
            }
        }
    }
    if profiles.is_empty() {
        profiles.push("default".to_string());
    }
    Ok(profiles)
}

pub fn create_profile(project_path: &str, profile_name: &str) -> Result<(), String> {
    let data = models::CachedProjectData::default();
    file_cache::save_project_data(project_path, profile_name, &data)
}

pub fn delete_profile(project_path: &str, profile_name: &str) -> Result<(), String> {
    if profile_name == "default" {
        return Err("profile.cannot_delete_default".to_string());
    }
    let config_path = file_cache::get_project_config_path(project_path, profile_name)?;
    if config_path.exists() {
        fs::remove_file(config_path).map_err(|e| e.to_string())
    } else {
        Err("profile.not_exist".to_string())
    }
}

pub fn rename_profile(
    project_path: &str,
    old_name: &str,
    new_name: &str,
) -> Result<(), String> {
    if old_name == "default" {
        return Err("profile.cannot_rename_default".to_string());
    }
    let old_path = file_cache::get_project_config_path(project_path, old_name)?;
    let new_path = file_cache::get_project_config_path(project_path, new_name)?;
    if !old_path.exists() {
        return Err("profile.old_not_exist".to_string());
    }
    if new_path.exists() {
        return Err("profile.new_name_exist".to_string());
    }
    fs::rename(old_path, new_path).map_err(|e| e.to_string())
}

pub fn list_groups_for_profile(
    project_path: &str,
    profile_name: &str,
) -> Result<Vec<models::Group>, String> {
    let project_data = file_cache::load_project_data(project_path, profile_name)?;
    Ok(project_data.groups)
}

pub fn clone_profile(
    project_path: &str,
    source_profile_name: &str,
    new_profile_name: &str,
) -> Result<(), String> {
    let source_data = file_cache::load_project_data(project_path, source_profile_name)?;

    let new_data = models::CachedProjectData {
        stats: source_data.stats,
        file_tree: source_data.file_tree,
        file_metadata_cache: source_data.file_metadata_cache,
        data_hash: source_data.data_hash,

        groups: vec![],
        sync_enabled: Some(false),
        sync_path: None,
        custom_ignore_patterns: Some(vec![]),
        is_watching_files: Some(false),
        export_use_full_tree: Some(false),
        export_with_line_numbers: Some(true),
        export_without_comments: Some(false),
        export_remove_debug_logs: Some(false),
        export_super_compressed: Some(false),
        always_apply_text: Some("".to_string()),
        export_exclude_extensions: Some(vec![]),
        git_export_mode_is_context: Some(false),
    };

    file_cache::save_project_data(project_path, new_profile_name, &new_data)
}

pub fn load_profile_data(
    project_path: &str,
    profile_name: &str,
) -> Result<models::CachedProjectData, String> {
    file_cache::load_project_data(project_path, profile_name)
}
