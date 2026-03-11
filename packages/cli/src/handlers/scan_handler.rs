use crate::commands;

pub fn handle_scan(path: String, profile: String) {
    println!("🔍 Scanning project: {}", path);
    println!("📁 Profile: {}", profile);
    
    match commands::scan_project(&path, &profile) {
        Ok(data) => {
            println!("✅ Scan hoàn tất!");
            println!("   📊 Files: {}", data.stats.total_files);
            println!("   📁 Dirs: {}", data.stats.total_dirs);
            println!("   💾 Size: {} bytes", data.stats.total_size);
            println!("   🔤 Tokens: {}", data.stats.total_tokens);
        }
        Err(e) => {
            eprintln!("❌ Lỗi scan: {}", e);
            std::process::exit(1);
        }
    }
}
