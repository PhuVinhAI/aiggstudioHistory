use crate::commands;

pub enum ChatAction {
    List { path: String, profile: String },
    Create { path: String, profile: String, title: String },
    Delete { path: String, profile: String, id: String },
    DeleteAll { path: String, profile: String },
}

pub fn handle_chat(action: ChatAction) {
    match action {
        ChatAction::List { path, profile } => {
            match commands::list_chat_sessions(&path, &profile) {
                Ok(sessions) => {
                    println!("💬 Chat sessions:");
                    if sessions.is_empty() {
                        println!("   (Chưa có session nào)");
                    } else {
                        for session in sessions {
                            println!("   • {} (ID: {})", session.title, session.id);
                            println!("     Created: {}", session.created_at.format("%Y-%m-%d %H:%M"));
                        }
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ChatAction::Create { path, profile, title } => {
            match commands::create_chat_session(&path, &profile, title.clone()) {
                Ok(session) => {
                    println!("✅ Đã tạo chat session: {}", title);
                    println!("   ID: {}", session.id);
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ChatAction::Delete { path, profile, id } => {
            match commands::delete_chat_session(&path, &profile, id.clone()) {
                Ok(_) => println!("✅ Đã xóa chat session: {}", id),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ChatAction::DeleteAll { path, profile } => {
            match commands::delete_all_chat_sessions(&path, &profile) {
                Ok(_) => println!("✅ Đã xóa tất cả chat sessions"),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }
}
