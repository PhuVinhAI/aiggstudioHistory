use crate::{commands, file_cache, models};

pub enum GroupAction {
    List { path: String, profile: String },
    Create { path: String, profile: String, name: String, files: Vec<String> },
    Update { path: String, profile: String, group_id: String, files: Vec<String> },
    Delete { path: String, profile: String, group_id: String },
    Export { path: String, profile: String, group_id: String, output: Option<String> },
}

pub fn handle_group(action: GroupAction) {
    match action {
        GroupAction::List { path, profile } => {
            match file_cache::load_project_data(&path, &profile) {
                Ok(data) => {
                    println!("🗂️  Groups trong profile '{}':", profile);
                    if data.groups.is_empty() {
                        println!("   (Chưa có group nào)");
                    } else {
                        for group in &data.groups {
                            println!("   • {} (ID: {})", group.name, group.id);
                            println!("     Files: {}, Tokens: {}", 
                                group.stats.total_files, group.stats.token_count);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        GroupAction::Create { path, profile, name, files } => {
            // Tạo group mới
            match file_cache::load_project_data(&path, &profile) {
                Ok(mut data) => {
                    let new_group = models::Group {
                        id: uuid::Uuid::new_v4().to_string(),
                        name: name.clone(),
                        paths: files.clone(),
                        stats: models::GroupStats::default(),
                        token_limit: None,
                    };
                    
                    // Calculate stats
                    match commands::calculate_group_stats_from_cache(&path, &profile, files) {
                        Ok(stats) => {
                            let mut group_with_stats = new_group;
                            group_with_stats.stats = stats;
                            data.groups.push(group_with_stats);
                            
                            match file_cache::save_project_data(&path, &profile, &data) {
                                Ok(_) => println!("✅ Đã tạo group: {}", name),
                                Err(e) => {
                                    eprintln!("❌ Lỗi lưu: {}", e);
                                    std::process::exit(1);
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("❌ Lỗi tính stats: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi load data: {}", e);
                    std::process::exit(1);
                }
            }
        }
        GroupAction::Update { path, profile, group_id, files } => {
            match commands::start_group_update(group_id.clone(), &path, &profile, files) {
                Ok(stats) => {
                    println!("✅ Cập nhật group thành công!");
                    println!("   Files: {}, Tokens: {}", stats.total_files, stats.token_count);
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        GroupAction::Delete { path, profile, group_id } => {
            match file_cache::load_project_data(&path, &profile) {
                Ok(mut data) => {
                    data.groups.retain(|g| g.id != group_id);
                    match file_cache::save_project_data(&path, &profile, &data) {
                        Ok(_) => println!("✅ Đã xóa group"),
                        Err(e) => {
                            eprintln!("❌ Lỗi: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        GroupAction::Export { path, profile, group_id, output } => {
            match commands::start_group_export(group_id, &path, &profile) {
                Ok(content) => {
                    if let Some(output_path) = output {
                        match std::fs::write(&output_path, &content) {
                            Ok(_) => println!("✅ Đã lưu vào: {}", output_path),
                            Err(e) => {
                                eprintln!("❌ Lỗi ghi file: {}", e);
                                std::process::exit(1);
                            }
                        }
                    } else {
                        println!("{}", content);
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi export: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }
}
