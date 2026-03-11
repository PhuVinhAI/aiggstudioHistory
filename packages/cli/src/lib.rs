// CLI version - converted from Tauri

// Khai báo các module
pub mod commands;
pub mod git_utils;
pub mod group_updater;
pub mod context_generator;
pub mod file_cache;
pub mod models;
pub mod project_scanner;

// CLI không cần run() function như Tauri
// Main logic sẽ ở main.rs với Clap
