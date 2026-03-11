use crate::commands;

pub enum GitAction {
    Status { path: String },
    Commits { path: String, limit: usize },
    Diff { path: String, commit: String },
    Checkout { path: String, target: String },
    Context { path: String, commit: String, output: Option<String> },
}

pub fn handle_git(action: GitAction) {
    match action {
        GitAction::Status { path } => {
            match commands::check_git_repository(path.clone()) {
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
            match commands::get_git_commits(path, 1, limit) {
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
            match commands::get_commit_diff(path, commit) {
                Ok(diff) => println!("{}", diff),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        GitAction::Checkout { path, target } => {
            // Kiểm tra xem target là commit hay branch
            if target.len() == 40 || target.len() == 7 {
                // Có thể là commit SHA
                match commands::checkout_commit(path, target.clone()) {
                    Ok(_) => println!("✅ Đã checkout commit: {}", target),
                    Err(e) => {
                        eprintln!("❌ Lỗi: {}", e);
                        std::process::exit(1);
                    }
                }
            } else {
                // Có thể là branch name
                match commands::checkout_branch(path, target.clone()) {
                    Ok(_) => println!("✅ Đã checkout branch: {}", target),
                    Err(e) => {
                        eprintln!("❌ Lỗi: {}", e);
                        std::process::exit(1);
                    }
                }
            }
        }
        GitAction::Context { path, commit, output } => {
            match commands::generate_commit_context(path, commit) {
                Ok(context) => {
                    if let Some(output_path) = output {
                        match std::fs::write(&output_path, &context) {
                            Ok(_) => println!("✅ Đã lưu commit context vào: {}", output_path),
                            Err(e) => {
                                eprintln!("❌ Lỗi ghi file: {}", e);
                                std::process::exit(1);
                            }
                        }
                    } else {
                        println!("{}", context);
                    }
                }
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }
}
