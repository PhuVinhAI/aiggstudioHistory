use crate::commands;

pub enum CheckpointAction {
    Create { path: String, profile: String, files: Vec<String> },
    Revert { path: String, profile: String, checkpoint_id: String, created_files: Vec<String> },
    Delete { path: String, profile: String, checkpoint_id: String },
}

pub fn handle_checkpoint(action: CheckpointAction) {
    match action {
        CheckpointAction::Create { path, profile, files } => {
            match commands::create_checkpoint(&path, &profile, files, None) {
                Ok(checkpoint_id) => {
                    println!("✅ Đã tạo checkpoint: {}", checkpoint_id);
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        CheckpointAction::Revert { path, profile, checkpoint_id, created_files } => {
            match commands::revert_to_checkpoint(&path, &profile, checkpoint_id.clone(), created_files) {
                Ok(staged_changes) => {
                    println!("✅ Đã revert về checkpoint: {}", checkpoint_id);
                    if let Some(changes) = staged_changes {
                        println!("   Staged changes: {} bytes", changes.len());
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        CheckpointAction::Delete { path, profile, checkpoint_id } => {
            match commands::delete_checkpoint(&path, &profile, checkpoint_id.clone()) {
                Ok(_) => println!("✅ Đã xóa checkpoint: {}", checkpoint_id),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }
}
