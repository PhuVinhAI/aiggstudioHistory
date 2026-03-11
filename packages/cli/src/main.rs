// FILE: packages/cli/src/main.rs
use clap::{Parser, Subcommand};

mod models;
mod core_logic;
mod exporter;
mod git_utils;

#[derive(Parser)]
#[command(name = "mc")]
#[command(about = "Master Context - Quản lý ngữ cảnh siêu nhẹ cho AI")]
#[command(version)]
struct Cli {
    /// Đường dẫn dự án (mặc định: thư mục hiện tại)
    #[arg(global = true, short, long, default_value = ".")]
    path: String,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Quản lý Group (Tạo, Xóa, Thêm/Bớt file)
    Group {
        #[command(subcommand)]
        action: GroupAction,
    },
    
    /// Xuất Group ra file text để làm context cho AI
    Export {
        /// ID của Group
        #[arg(short, long)]
        id: String,
        /// Đường dẫn file đầu ra (VD: context.txt)
        #[arg(short, long)]
        out: String,
        /// Xóa comment
        #[arg(long, default_value_t = false)]
        no_comments: bool,
        /// Xóa các dòng debug/console log
        #[arg(long, default_value_t = false)]
        no_logs: bool,
        /// Thêm số thứ tự dòng
        #[arg(long, default_value_t = false)]
        line_numbers: bool,
    },

    /// Lấy Git Diff của một commit
    GitDiff {
        /// Mã commit SHA (hoặc HEAD)
        #[arg(short, long)]
        commit: String,
    }
}

#[derive(Subcommand)]
enum GroupAction {
    /// Xem danh sách Group
    List,
    /// Tạo Group mới
    Create { #[arg(short, long)] name: String },
    /// Xóa Group
    Delete { #[arg(short, long)] id: String },
    /// Thêm file/thư mục vào Group (Tự động đếm Token)
    Add { #[arg(short, long)] id: String, #[arg(short, long)] path: String },
    /// Xóa file/thư mục khỏi Group
    Remove { #[arg(short, long)] id: String, #[arg(short, long)] path: String },
}

fn main() {
    let cli = Cli::parse();
    let project_path = &cli.path;

    match cli.command {
        Commands::Group { action } => match action {
            GroupAction::List => {
                let data = core_logic::load_data(project_path);
                println!("📂 Danh sách Group trong dự án:");
                if data.groups.is_empty() {
                    println!("  (Chưa có group nào)");
                }
                for g in data.groups {
                    println!("- [{}] {} (Files: {}, Tokens: {})", g.id, g.name, g.total_files, g.total_tokens);
                    for p in g.paths { println!("   └─ {}", p); }
                }
            }
            GroupAction::Create { name } => {
                let g = core_logic::create_group(project_path, name);
                println!("✅ Đã tạo Group: {} (ID: {})", g.name, g.id);
            }
            GroupAction::Delete { id } => {
                match core_logic::delete_group(project_path, &id) {
                    Ok(_) => println!("✅ Đã xóa Group: {}", id),
                    Err(e) => eprintln!("❌ Lỗi: {}", e),
                }
            }
            GroupAction::Add { id, path } => {
                println!("⏳ Đang quét và đếm token...");
                match core_logic::add_path(project_path, &id, path.clone()) {
                    Ok(g) => println!("✅ Đã thêm '{}'. Group hiện tại: {} files, {} tokens.", path, g.total_files, g.total_tokens),
                    Err(e) => eprintln!("❌ Lỗi: {}", e),
                }
            }
            GroupAction::Remove { id, path } => {
                println!("⏳ Đang tính toán lại token...");
                match core_logic::remove_path(project_path, &id, path.clone()) {
                    Ok(g) => println!("✅ Đã xóa '{}'. Group còn lại: {} files, {} tokens.", path, g.total_files, g.total_tokens),
                    Err(e) => eprintln!("❌ Lỗi: {}", e),
                }
            }
        },
        
        Commands::Export { id, out, no_comments, no_logs, line_numbers } => {
            let settings = exporter::ExportSettings { no_comments, no_logs, line_numbers };
            println!("⏳ Đang tổng hợp Context...");
            match exporter::export_group(project_path, &id, &out, settings) {
                Ok(_) => println!("✅ Đã lưu file context tại: {}", out),
                Err(e) => eprintln!("❌ Lỗi xuất file: {}", e),
            }
        }

        Commands::GitDiff { commit } => {
            match git_utils::get_git_diff(project_path, &commit) {
                Ok(diff) => println!("{}", diff),
                Err(e) => eprintln!("❌ Lỗi: {}", e),
            }
        }
    }
}
