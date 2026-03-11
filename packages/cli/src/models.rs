// FILE: packages/cli/src/models.rs
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Group {
    pub id: String,
    pub name: String,
    pub paths: Vec<String>, // Đường dẫn file/thư mục
    pub total_tokens: usize,
    pub total_files: usize,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct ProjectData {
    pub groups: Vec<Group>,
}
