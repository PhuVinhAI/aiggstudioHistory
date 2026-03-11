// CLI Handlers - tách logic xử lý ra khỏi main.rs
pub mod scan_handler;
pub mod profile_handler;
pub mod group_handler;
pub mod export_handler;
pub mod git_handler;
pub mod chat_handler;
pub mod checkpoint_handler;

pub use scan_handler::handle_scan;
pub use profile_handler::handle_profile;
pub use group_handler::handle_group;
pub use export_handler::handle_export;
pub use git_handler::handle_git;
pub use chat_handler::handle_chat;
pub use checkpoint_handler::handle_checkpoint;
