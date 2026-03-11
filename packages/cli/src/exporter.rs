// FILE: packages/cli/src/exporter.rs
use crate::core_logic::load_data;
use std::fs;
use std::path::Path;
use ignore::WalkBuilder;
use regex::Regex;
use lazy_static::lazy_static;

lazy_static! {
    static ref C_COMMENT: Regex = Regex::new(r"(?m)^[ \t]*//.*$|(?s)/\*.*?\*/").unwrap();
    static ref HASH_COMMENT: Regex = Regex::new(r"(?m)^[ \t]*#.*$").unwrap();
    static ref HTML_COMMENT: Regex = Regex::new(r"(?s)<!--.*?-->").unwrap();
    static ref DEBUG_LOG: Regex = Regex::new(r"(?im)^\s*(?:console\.(log|warn|error|info|debug)|print|println!|dbg!)\s*\(.*\);?\s*\r?\n?").unwrap();
}

pub struct ExportSettings {
    pub no_comments: bool,
    pub no_logs: bool,
    pub line_numbers: bool,
}

pub fn export_group(project_path: &str, group_id: &str, output_path: &str, settings: ExportSettings) -> Result<(), String> {
    let data = load_data(project_path);
    let group = data.groups.iter().find(|g| g.id == group_id).ok_or("Group không tồn tại")?;
    
    let root = Path::new(project_path);
    let mut final_content = format!("CONTEXT TỪ GROUP: {} (ID: {})\n", group.name, group.id);
    final_content.push_str("================================================\n\n");

    for path_str in &group.paths {
        let target_path = root.join(path_str);
        if !target_path.exists() { continue; }

        for result in WalkBuilder::new(&target_path).build().filter_map(Result::ok) {
            if result.metadata().map(|m| m.is_file()).unwrap_or(false) {
                if let Ok(mut content) = fs::read_to_string(result.path()) {
                    let rel_path = result.path().strip_prefix(root).unwrap().to_string_lossy();
                    
                    if settings.no_logs {
                        content = DEBUG_LOG.replace_all(&content, "").to_string();
                    }
                    if settings.no_comments {
                        let ext = result.path().extension().and_then(|s| s.to_str()).unwrap_or("");
                        content = match ext {
                            "js" | "ts" | "jsx" | "tsx" | "rs" | "go" | "c" | "cpp" | "java" | "cs" => C_COMMENT.replace_all(&content, "").to_string(),
                            "py" | "sh" | "yaml" | "yml" | "rb" => HASH_COMMENT.replace_all(&content, "").to_string(),
                            "html" | "xml" | "md" => HTML_COMMENT.replace_all(&content, "").to_string(),
                            _ => content
                        };
                        // Xóa các dòng trống thừa do xóa comment
                        content = content.lines().filter(|l| !l.trim().is_empty()).collect::<Vec<_>>().join("\n");
                    }

                    final_content.push_str(&format!("--- FILE: {} ---\n", rel_path));
                    if settings.line_numbers {
                        for (i, line) in content.lines().enumerate() {
                            final_content.push_str(&format!("{:>4} | {}\n", i + 1, line));
                        }
                    } else {
                        final_content.push_str(&content);
                        final_content.push('\n');
                    }
                    final_content.push_str("\n\n");
                }
            }
        }
    }

    fs::write(output_path, final_content).map_err(|e| e.to_string())?;
    Ok(())
}
