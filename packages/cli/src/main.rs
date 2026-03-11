use clap::{Parser, Subcommand};
use anyhow::Result;

mod commands;
mod context_generator;
mod file_cache;
mod git_utils;
mod group_updater;
mod models;
mod project_scanner;
mod handlers;

#[derive(Parser)]
#[command(name = "mc")]
#[command(about = "Master Context - Quản lý và tạo ngữ cảnh cho dự án lập trình")]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan và phân tích project
    Scan {
        #[arg(short, long)]
        path: String,
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
    },
    
    /// Quản lý profiles
    Profile {
        #[command(subcommand)]
        action: ProfileAction,
    },
    
    /// Quản lý groups
    Group {
        #[command(subcommand)]
        action: GroupAction,
    },
    
    /// Export context
    Export {
        #[arg(short, long)]
        path: String,
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        #[arg(short, long)]
        group: Option<String>,
        #[arg(short, long)]
        output: Option<String>,
    },
    
    /// Git operations
    Git {
        #[command(subcommand)]
        action: GitAction,
    },
    
    /// Chat management
    Chat {
        #[command(subcommand)]
        action: ChatAction,
    },
    
    /// Checkpoint management
    Checkpoint {
        #[command(subcommand)]
        action: CheckpointAction,
    },
    
    /// Quản lý cài đặt dự án & export
    Settings {
        #[command(subcommand)]
        action: SettingsAction,
    },
    
    /// Thao tác trực tiếp với file và cây thư mục
    Project {
        #[command(subcommand)]
        action: ProjectAction,
    },
}

#[derive(Subcommand)]
enum ProfileAction {
    List { #[arg(short, long)] path: String },
    Create { #[arg(short, long)] path: String, #[arg(short, long)] name: String },
    Delete { #[arg(short, long)] path: String, #[arg(short, long)] name: String },
    Rename { #[arg(short, long)] path: String, #[arg(long)] old_name: String, #[arg(long)] new_name: String },
    Clone { #[arg(short, long)] path: String, #[arg(short, long)] source: String, #[arg(short, long)] target: String },
}

#[derive(Subcommand)]
enum GroupAction {
    List { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String },
    Create { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] name: String, #[arg(short = 'f', long)] files: Vec<String> },
    Update { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] group_id: String, #[arg(short = 'f', long)] files: Vec<String> },
    Delete { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] group_id: String },
    Export { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] group_id: String, #[arg(short, long)] output: Option<String> },
}

#[derive(Subcommand)]
enum GitAction {
    Status { #[arg(short, long)] path: String },
    Commits { #[arg(short, long)] path: String, #[arg(short, long, default_value = "10")] limit: usize },
    Diff { #[arg(short, long)] path: String, #[arg(short, long)] commit: String },
    Checkout { #[arg(short, long)] path: String, #[arg(short, long)] target: String },
    Context { #[arg(short, long)] path: String, #[arg(short, long)] commit: String, #[arg(short, long)] output: Option<String> },
}

#[derive(Subcommand)]
enum ChatAction {
    List { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String },
    Create { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] title: String },
    Delete { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] id: String },
    DeleteAll { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String },
}

#[derive(Subcommand)]
enum CheckpointAction {
    Create { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short = 'f', long)] files: Vec<String> },
    Revert { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] checkpoint_id: String, #[arg(long, default_value = "")] created_files: Vec<String> },
    Delete { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] checkpoint_id: String },
}

#[derive(Subcommand)]
enum SettingsAction {
    View { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String },
    Sync { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(long)] enable: bool, #[arg(long)] sync_path: Option<String> },
    Ignore { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short = 'i', long)] patterns: Vec<String> },
    ExportOpts { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(long)] full_tree: Option<bool>, #[arg(long)] line_numbers: Option<bool>, #[arg(long)] no_comments: Option<bool>, #[arg(long)] no_logs: Option<bool>, #[arg(long)] compressed: Option<bool> },
}

#[derive(Subcommand)]
enum ProjectAction {
    Tree { #[arg(short, long)] path: String, #[arg(short, long, default_value = "")] dir: String },
    Read { #[arg(short, long)] path: String, #[arg(short, long)] file: String, #[arg(short, long)] start: Option<usize>, #[arg(short, long)] end: Option<usize> },
    Exclude { #[arg(short, long)] path: String, #[arg(short = 'P', long, default_value = "default")] profile: String, #[arg(short, long)] file: String, #[arg(short = 'r', long, value_parser = parse_range)] ranges: Vec<(usize, usize)> },
}

// Helper function để parse string "10-20" thành tuple (10, 20) cho lệnh Exclude
fn parse_range(s: &str) -> Result<(usize, usize), String> {
    let parts: Vec<&str> = s.split('-').collect();
    if parts.len() != 2 {
        return Err("Format phải là start-end (ví dụ: 10-20)".to_string());
    }
    let start = parts[0].parse().map_err(|_| "Start không phải là số".to_string())?;
    let end = parts[1].parse().map_err(|_| "End không phải là số".to_string())?;
    Ok((start, end))
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan { path, profile } => handlers::handle_scan(path, profile),
        
        Commands::Profile { action } => {
            let h = match action {
                ProfileAction::List { path } => handlers::profile_handler::ProfileAction::List { path },
                ProfileAction::Create { path, name } => handlers::profile_handler::ProfileAction::Create { path, name },
                ProfileAction::Delete { path, name } => handlers::profile_handler::ProfileAction::Delete { path, name },
                ProfileAction::Rename { path, old_name, new_name } => handlers::profile_handler::ProfileAction::Rename { path, old_name, new_name },
                ProfileAction::Clone { path, source, target } => handlers::profile_handler::ProfileAction::Clone { path, source, target },
            };
            handlers::handle_profile(h);
        }
        
        Commands::Group { action } => {
            let h = match action {
                GroupAction::List { path, profile } => handlers::group_handler::GroupAction::List { path, profile },
                GroupAction::Create { path, profile, name, files } => handlers::group_handler::GroupAction::Create { path, profile, name, files },
                GroupAction::Update { path, profile, group_id, files } => handlers::group_handler::GroupAction::Update { path, profile, group_id, files },
                GroupAction::Delete { path, profile, group_id } => handlers::group_handler::GroupAction::Delete { path, profile, group_id },
                GroupAction::Export { path, profile, group_id, output } => handlers::group_handler::GroupAction::Export { path, profile, group_id, output },
            };
            handlers::handle_group(h);
        }
        
        Commands::Export { path, profile, group, output } => handlers::handle_export(path, profile, group, output),
        
        Commands::Git { action } => {
            let h = match action {
                GitAction::Status { path } => handlers::git_handler::GitAction::Status { path },
                GitAction::Commits { path, limit } => handlers::git_handler::GitAction::Commits { path, limit },
                GitAction::Diff { path, commit } => handlers::git_handler::GitAction::Diff { path, commit },
                GitAction::Checkout { path, target } => handlers::git_handler::GitAction::Checkout { path, target },
                GitAction::Context { path, commit, output } => handlers::git_handler::GitAction::Context { path, commit, output },
            };
            handlers::handle_git(h);
        }
        
        Commands::Chat { action } => {
            let h = match action {
                ChatAction::List { path, profile } => handlers::chat_handler::ChatAction::List { path, profile },
                ChatAction::Create { path, profile, title } => handlers::chat_handler::ChatAction::Create { path, profile, title },
                ChatAction::Delete { path, profile, id } => handlers::chat_handler::ChatAction::Delete { path, profile, id },
                ChatAction::DeleteAll { path, profile } => handlers::chat_handler::ChatAction::DeleteAll { path, profile },
            };
            handlers::handle_chat(h);
        }
        
        Commands::Checkpoint { action } => {
            let h = match action {
                CheckpointAction::Create { path, profile, files } => handlers::checkpoint_handler::CheckpointAction::Create { path, profile, files },
                CheckpointAction::Revert { path, profile, checkpoint_id, created_files } => handlers::checkpoint_handler::CheckpointAction::Revert { path, profile, checkpoint_id, created_files },
                CheckpointAction::Delete { path, profile, checkpoint_id } => handlers::checkpoint_handler::CheckpointAction::Delete { path, profile, checkpoint_id },
            };
            handlers::handle_checkpoint(h);
        }
        
        Commands::Settings { action } => {
            let h = match action {
                SettingsAction::View { path, profile } => handlers::settings_handler::SettingsAction::View { path, profile },
                SettingsAction::Sync { path, profile, enable, sync_path } => handlers::settings_handler::SettingsAction::Sync { path, profile, enable, sync_path },
                SettingsAction::Ignore { path, profile, patterns } => handlers::settings_handler::SettingsAction::Ignore { path, profile, patterns },
                SettingsAction::ExportOpts { path, profile, full_tree, line_numbers, no_comments, no_logs, compressed } =>
                    handlers::settings_handler::SettingsAction::ExportOpts { path, profile, full_tree, line_numbers, no_comments, no_logs, compressed },
            };
            handlers::handle_settings(h);
        }
        
        Commands::Project { action } => {
            let h = match action {
                ProjectAction::Tree { path, dir } => handlers::project_handler::ProjectAction::Tree { path, dir },
                ProjectAction::Read { path, file, start, end } => handlers::project_handler::ProjectAction::Read { path, file, start, end },
                ProjectAction::Exclude { path, profile, file, ranges } => handlers::project_handler::ProjectAction::Exclude { path, profile, file, ranges },
            };
            handlers::handle_project(h);
        }
    }

    Ok(())
}
