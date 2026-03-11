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

#[derive(Subcommand, Debug)]
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

#[derive(Subcommand, Debug)]
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

#[derive(Subcommand, Debug)]
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

#[derive(Subcommand, Debug)]
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

#[derive(Subcommand, Debug)]
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

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan { path, profile } => {
            println!("🔍 Scanning project: {}", path);
            println!("📁 Profile: {}", profile);
            
            match commands::project_commands::scan_project(&path, &profile) {
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
        
        Commands::Profile { action } => {
            match action {
                ProfileAction::List => {
                    println!("📋 Chức năng này cần project path");
                    println!("   Sử dụng: mc profile list --path <PATH>");
                }
                ProfileAction::Create { name } => {
                    println!("✨ Tạo profile: {}", name);
                    println!("   Chức năng này cần project path");
                }
                ProfileAction::Delete { name } => {
                    println!("🗑️  Xóa profile: {}", name);
                    println!("   Chức năng này cần project path");
                }
                ProfileAction::Rename { old_name, new_name } => {
                    println!("✏️  Đổi tên profile: {} -> {}", old_name, new_name);
                    println!("   Chức năng này cần project path");
                }
                ProfileAction::Clone { source, target } => {
                    println!("📋 Clone profile: {} -> {}", source, target);
                    println!("   Chức năng này cần project path");
                }
            }
        }
        
        Commands::Group { action } => {
            match action {
                GroupAction::List { path, profile } => {
                    match file_cache::load_project_data(&path, &profile) {
                        Ok(data) => {
                            println!("🗂️  Groups trong profile '{}':", profile);
                            if data.groups.is_empty() {
                                println!("   (Chưa có group nào)");
                            } else {
                                for group in &data.groups {
                                    println!("   • {} (ID: {})", group.name, group.id);
                                    println!("     Files: {}, Tokens: {}", 
                                        group.stats.total_files, group.stats.token_count);
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("❌ Lỗi: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                GroupAction::Create { path, profile, name, files } => {
                    println!("✨ Tạo group '{}' với {} files", name, files.len());
                    println!("   Chức năng này đang được phát triển");
                }
                GroupAction::Update { path, profile, group_id, files } => {
                    println!("🔄 Update group {} với {} files", group_id, files.len());
                    match commands::group_commands::start_group_update(
                        group_id, &path, &profile, files
                    ) {
                        Ok(stats) => {
                            println!("✅ Cập nhật thành công!");
                            println!("   Files: {}, Tokens: {}", stats.total_files, stats.token_count);
                        }
                        Err(e) => {
                            eprintln!("❌ Lỗi: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
            }
        }
        
        Commands::Export { path, profile, group, output } => {
            println!("📤 Exporting context...");
            
            let context = if let Some(group_id) = group {
                commands::group_commands::start_group_export(group_id, &path, &profile)
            } else {
                commands::project_commands::start_project_export(&path, &profile)
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
        
        Commands::Git { action } => {
            match action {
                GitAction::Status { path } => {
                    match commands::git_commands::check_git_repository(path.clone()) {
                        Ok(info) => {
                            if info.is_repository {
                                println!("📂 Git Repository");
                                if let Some(branch) = info.current_branch {
                                    println!("   Branch: {}", branch);
                                }
                                if let Some(sha) = info.current_sha {
                                    println!("   Commit: {}", &sha[..8]);
                                }
                                if let Some(url) = info.remote_url {
                                    println!("   Remote: {}", url);
                                }
                            } else {
                                println!("❌ Không phải git repository");
                            }
                        }
                        Err(e) => {
                            eprintln!("❌ Lỗi: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                GitAction::Commits { path, limit } => {
                    match commands::git_commands::get_git_commits(path, 1, limit) {
                        Ok(commits) => {
                            println!("📜 Recent commits:");
                            for commit in commits {
                                println!("   {} - {} ({})", 
                                    &commit.sha[..8], commit.message, commit.author);
                            }
                        }
                        Err(e) => {
                            eprintln!("❌ Lỗi: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                GitAction::Diff { path, commit } => {
                    match commands::git_commands::get_commit_diff(path, commit) {
                        Ok(diff) => println!("{}", diff),
                        Err(e) => {
                            eprintln!("❌ Lỗi: {}", e);
                            std::process::exit(1);
                        }
                    }
                }
                GitAction::Checkout { path, target } => {
                    println!("🔀 Checkout: {}", target);
                    println!("   Chức năng này cần xác nhận từ user");
                }
            }
        }
        
        Commands::Chat { action } => {
            println!("💬 Chat management");
            println!("   Chức năng này cần project path và profile");
        }
        
        Commands::Checkpoint { action } => {
            println!("📍 Checkpoint management");
            println!("   Chức năng này đang được phát triển");
        }
    }

    Ok(())
}
