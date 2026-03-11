use clap::{Parser, Subcommand};
use anyhow::Result;

mod commands;
mod context_generator;
mod file_cache;
mod git_utils;
mod group_updater;
mod models;
mod project_scanner;

#[derive(Parser)]
#[command(name = "mc")]
#[command(about = "Master Context - Quản lý và tạo ngữ cảnh cho dự án lập trình", long_about = None)]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan và phân tích project
    Scan {
        /// Đường dẫn đến project
        #[arg(short, long)]
        path: String,
        
        /// Tên profile (mặc định: "default")
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
        /// Đường dẫn project
        #[arg(short, long)]
        path: String,
        
        /// Profile name
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        
        /// Group ID (nếu không có sẽ export toàn bộ project)
        #[arg(short, long)]
        group: Option<String>,
        
        /// Output file
        #[arg(short, long)]
        output: Option<String>,
    },
    
    /// Git operations
    Git {
        #[command(subcommand)]
        action: GitAction,
    },
    
    /// AI chat session management
    Chat {
        #[command(subcommand)]
        action: ChatAction,
    },
    
    /// Checkpoint management
    Checkpoint {
        #[command(subcommand)]
        action: CheckpointAction,
    },
}

#[derive(Subcommand)]
enum ProfileAction {
    /// List tất cả profiles
    List,
    
    /// Tạo profile mới
    Create {
        #[arg(short, long)]
        name: String,
    },
    
    /// Xóa profile
    Delete {
        #[arg(short, long)]
        name: String,
    },
    
    /// Đổi tên profile
    Rename {
        #[arg(short, long)]
        old_name: String,
        
        #[arg(short, long)]
        new_name: String,
    },
    
    /// Clone profile
    Clone {
        #[arg(short, long)]
        source: String,
        
        #[arg(short, long)]
        target: String,
    },
}

#[derive(Subcommand)]
enum GroupAction {
    /// List groups trong profile
    List {
        #[arg(short, long)]
        path: String,
        
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
    },
    
    /// Tạo group mới
    Create {
        #[arg(short, long)]
        path: String,
        
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        
        #[arg(short, long)]
        name: String,
        
        #[arg(short = 'f', long)]
        files: Vec<String>,
    },
    
    /// Update group
    Update {
        #[arg(short, long)]
        path: String,
        
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        
        #[arg(short, long)]
        group_id: String,
        
        #[arg(short = 'f', long)]
        files: Vec<String>,
    },
}

#[derive(Subcommand)]
enum GitAction {
    /// Check git repository info
    Status {
        #[arg(short, long)]
        path: String,
    },
    
    /// List commits
    Commits {
        #[arg(short, long)]
        path: String,
        
        #[arg(short, long, default_value = "10")]
        limit: usize,
    },
    
    /// Show commit diff
    Diff {
        #[arg(short, long)]
        path: String,
        
        #[arg(short, long)]
        commit: String,
    },
    
    /// Checkout commit/branch
    Checkout {
        #[arg(short, long)]
        path: String,
        
        #[arg(short, long)]
        target: String,
    },
}

#[derive(Subcommand)]
enum ChatAction {
    /// List chat sessions
    List,
    
    /// Create new chat session
    Create {
        #[arg(short, long)]
        title: String,
    },
    
    /// Delete chat session
    Delete {
        #[arg(short, long)]
        id: String,
    },
}

#[derive(Subcommand)]
enum CheckpointAction {
    /// Create checkpoint
    Create {
        #[arg(short, long)]
        path: String,
        
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        
        #[arg(short, long)]
        name: String,
    },
    
    /// Revert to checkpoint
    Revert {
        #[arg(short, long)]
        path: String,
        
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        
        #[arg(short, long)]
        checkpoint_id: String,
    },
    
    /// Delete checkpoint
    Delete {
        #[arg(short, long)]
        path: String,
        
        #[arg(short = 'P', long, default_value = "default")]
        profile: String,
        
        #[arg(short, long)]
        checkpoint_id: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan { path, profile } => {
            println!("🔍 Scanning project: {}", path);
            println!("📁 Profile: {}", profile);
            commands::project_commands::scan_project_cli(&path, &profile).await?;
        }
        Commands::Profile { action } => {
            commands::profile_commands::handle_profile_action(action).await?;
        }
        Commands::Group { action } => {
            commands::group_commands::handle_group_action(action).await?;
        }
        Commands::Export { path, profile, group, output } => {
            commands::project_commands::export_cli(&path, &profile, group.as_deref(), output.as_deref()).await?;
        }
        Commands::Git { action } => {
            commands::git_commands::handle_git_action(action).await?;
        }
        Commands::Chat { action } => {
            commands::ai_commands::handle_chat_action(action).await?;
        }
        Commands::Checkpoint { action } => {
            commands::checkpoint_commands::handle_checkpoint_action(action).await?;
        }
    }

    Ok(())
}
