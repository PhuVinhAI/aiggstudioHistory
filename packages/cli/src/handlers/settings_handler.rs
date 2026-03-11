// Settings Handler - xử lý các lệnh quản lý cài đặt dự án & export
use crate::{commands, file_cache};

pub enum SettingsAction {
    View { path: String, profile: String },
    Sync { path: String, profile: String, enable: bool, sync_path: Option<String> },
    Ignore { path: String, profile: String, patterns: Vec<String> },
    ExportOpts {
        path: String,
        profile: String,
        full_tree: Option<bool>,
        line_numbers: Option<bool>,
        no_comments: Option<bool>,
        no_logs: Option<bool>,
        compressed: Option<bool>,
    },
}

pub fn handle_settings(action: SettingsAction) {
    match action {
        SettingsAction::View { path, profile } => {
            match file_cache::load_project_data(&path, &profile) {
                Ok(data) => {
                    println!("⚙️  Cấu hình Profile: {}", profile);
                    println!("   • Sync enabled: {}", data.sync_enabled.unwrap_or(false));
                    println!("   • Sync path: {:?}", data.sync_path);
                    println!("   • Ignore patterns: {:?}", data.custom_ignore_patterns.unwrap_or_default());
                    println!("   • Export Use Full Tree: {}", data.export_use_full_tree.unwrap_or(false));
                    println!("   • Export With Line Numbers: {}", data.export_with_line_numbers.unwrap_or(true));
                    println!("   • Export Without Comments: {}", data.export_without_comments.unwrap_or(false));
                    println!("   • Export Remove Debug Logs: {}", data.export_remove_debug_logs.unwrap_or(false));
                    println!("   • Export Super Compressed: {}", data.export_super_compressed.unwrap_or(false));
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        SettingsAction::Sync { path, profile, enable, sync_path } => {
            match commands::update_sync_settings(&path, &profile, enable, sync_path) {
                Ok(_) => println!("✅ Đã cập nhật cấu hình Sync"),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        SettingsAction::Ignore { path, profile, patterns } => {
            match commands::update_custom_ignore_patterns(&path, &profile, patterns) {
                Ok(_) => println!("✅ Đã cập nhật Ignore Patterns"),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        SettingsAction::ExportOpts {
            path,
            profile,
            full_tree,
            line_numbers,
            no_comments,
            no_logs,
            compressed,
        } => {
            let mut has_error = false;
            if let Some(v) = full_tree {
                if let Err(e) = commands::set_export_use_full_tree_setting(&path, &profile, v) {
                    eprintln!("Lỗi: {}", e);
                    has_error = true;
                }
            }
            if let Some(v) = line_numbers {
                if let Err(e) = commands::set_export_with_line_numbers_setting(&path, &profile, v) {
                    eprintln!("Lỗi: {}", e);
                    has_error = true;
                }
            }
            if let Some(v) = no_comments {
                if let Err(e) = commands::set_export_without_comments_setting(&path, &profile, v) {
                    eprintln!("Lỗi: {}", e);
                    has_error = true;
                }
            }
            if let Some(v) = no_logs {
                if let Err(e) = commands::set_export_remove_debug_logs_setting(&path, &profile, v) {
                    eprintln!("Lỗi: {}", e);
                    has_error = true;
                }
            }
            if let Some(v) = compressed {
                if let Err(e) = commands::set_export_super_compressed_setting(&path, &profile, v) {
                    eprintln!("Lỗi: {}", e);
                    has_error = true;
                }
            }

            if !has_error {
                println!("✅ Đã cập nhật tùy chọn Export");
            } else {
                std::process::exit(1);
            }
        }
    }
}
