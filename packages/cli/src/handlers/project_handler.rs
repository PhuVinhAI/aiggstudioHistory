// Project Handler - thao tác trực tiếp với file và cây thư mục
use crate::commands;

pub enum ProjectAction {
    Tree { path: String, dir: String },
    Read { path: String, file: String, start: Option<usize>, end: Option<usize> },
    Exclude { path: String, profile: String, file: String, ranges: Vec<(usize, usize)> },
}

pub fn handle_project(action: ProjectAction) {
    match action {
        ProjectAction::Tree { path, dir } => {
            match commands::generate_directory_tree(path, dir) {
                Ok(tree) => println!("{}", tree),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ProjectAction::Read { path, file, start, end } => {
            match commands::read_file_with_lines(path, file, start, end) {
                Ok(content) => println!("{}", content),
                Err(e) => {
                    eprintln!("❌ Lỗi đọc file: {}", e);
                    std::process::exit(1);
                }
            }
        }
        ProjectAction::Exclude { path, profile, file, ranges } => {
            match commands::update_file_exclusions(&path, &profile, file.clone(), ranges) {
                Ok(_) => println!("✅ Đã cập nhật vùng loại trừ (excluded ranges) cho file: {}", file),
                Err(e) => {
                    eprintln!("❌ Lỗi: {}", e);
                    std::process::exit(1);
                }
            }
        }
    }
}
