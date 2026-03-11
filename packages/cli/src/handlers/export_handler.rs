use crate::commands;

pub fn handle_export(path: String, profile: String, group: Option<String>, output: Option<String>) {
    println!("📤 Exporting context...");
    
    let context = if let Some(group_id) = group {
        commands::start_group_export(group_id, &path, &profile)
    } else {
        commands::start_project_export(&path, &profile)
    };
    
    match context {
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
