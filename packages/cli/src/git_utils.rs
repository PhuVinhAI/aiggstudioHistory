// FILE: packages/cli/src/git_utils.rs
use std::process::Command;

pub fn get_git_diff(project_path: &str, commit_sha: &str) -> Result<String, String> {
    let output = Command::new("git")
        .current_dir(project_path)
        .arg("show")
        .arg("--patch")
        .arg(commit_sha)
        .output()
        .map_err(|e| format!("Lỗi gọi lệnh git: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
