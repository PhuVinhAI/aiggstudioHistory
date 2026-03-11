// src-tauri/src/commands/watcher_commands.rs
// CLI version - file watching removed (not applicable for CLI)
use lazy_static::lazy_static;
use notify::{RecommendedWatcher, Watcher};
use std::sync::Mutex;
use std::time::Instant;

lazy_static! {
    static ref FILE_WATCHER: Mutex<Option<RecommendedWatcher>> = Mutex::new(None);
    static ref LAST_CHANGE_TIME: Mutex<Option<Instant>> = Mutex::new(None);
}

// CLI: File watching không có ý nghĩa trong CLI, nhưng giữ lại function signature để tương thích
pub fn start_file_watching(path: String) -> Result<(), String> {
    println!("[CLI] File watching is not supported in CLI mode");
    Ok(())
}

pub fn stop_file_watching() -> Result<(), String> {
    if let Some(watcher) = FILE_WATCHER.lock().unwrap().take() {
        drop(watcher);
        println!("[Watcher] Stopped watching.");
    }
    Ok(())
}