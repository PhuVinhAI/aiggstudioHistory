use crate::commands;

pub enum ProfileAction {
    List { path: String },
    Create { path: String, name: String },
    Delete { path: String, name: String },
    Rename { path: String, old_name: String, new_name: String },
    Clone { path: String, source: String, target: String },
}

pub fn handle_profile(action: ProfileAction) {
    match action {
        ProfileAction::List { path } => {
            match commands::list_profiles(&path) {
                Ok(profiles) => {
                    println!("📋 Profiles trong project:");
                    if profiles.is_empty() {
                        println!("   (Chưa có profile nào)");
                    } else {
                        for profile in profiles {
                            println!("   • {}", profile);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ProfileAction::Create { path, name } => {
            match commands::create_profile(&path, &name) {
                Ok(_) => println!("✅ Đã tạo profile: {}", name),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ProfileAction::Delete { path, name } => {
            match commands::delete_profile(&path, &name) {
                Ok(_) => println!("✅ Đã xóa profile: {}", name),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ProfileAction::Rename { path, old_name, new_name } => {
            match commands::rename_profile(&path, &old_name, &new_name) {
                Ok(_) => println!("✅ Đã đổi tên: {} → {}", old_name, new_name),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ProfileAction::Clone { path, source, target } => {
            match commands::clone_profile(&path, &source, &target) {
                Ok(_) => println!("✅ Đã clone: {} → {}", source, target),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }
}
