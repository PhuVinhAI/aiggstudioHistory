import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import ignore from 'ignore';
import { get_encoding } from 'tiktoken';

// 1. Quản lý lưu trữ - lưu data vào ~/.config/mc/projects/{hash}.json
const getProjectFile = (projectPath) => {
    const hash = crypto.createHash('sha256').update(projectPath).digest('hex');
    const configDir = path.join(os.homedir(), '.config', 'mc', 'projects');
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    return path.join(configDir, `${hash}.json`);
};

export const loadData = (projectPath) => {
    const file = getProjectFile(projectPath);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
    return { groups: [] };
};

export const saveData = (projectPath, data) => {
    fs.writeFileSync(getProjectFile(projectPath), JSON.stringify(data, null, 2));
};

// 2. Quét file & Đếm token (Tôn trọng .gitignore)
const getAllFiles = (targetPath, ig, rootPath) => {
    let results = [];
    if (!fs.existsSync(targetPath)) return results;

    const stat = fs.statSync(targetPath);
    if (stat.isFile()) {
        const relPath = path.relative(rootPath, targetPath);
        if (!ig.ignores(relPath)) results.push(targetPath);
        return results;
    }

    const items = fs.readdirSync(targetPath);
    for (const item of items) {
        if (item === '.git' || item === 'node_modules') continue; // Bỏ qua mặc định cứng
        const fullPath = path.join(targetPath, item);
        const relPath = path.relative(rootPath, fullPath);

        if (!ig.ignores(relPath) && !ig.ignores(relPath + '/')) {
            results = results.concat(getAllFiles(fullPath, ig, rootPath));
        }
    }
    return results;
};

export const calculateTokens = (projectPath, pathsArray) => {
    const enc = get_encoding("cl100k_base");
    let totalTokens = 0;
    let totalFiles = 0;

    // Load .gitignore nếu có
    const ig = ignore();
    const gitignorePath = path.join(projectPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        ig.add(fs.readFileSync(gitignorePath, 'utf8'));
    }

    const allFiles = new Set();
    for (const p of pathsArray) {
        const targetPath = path.join(projectPath, p);
        const files = getAllFiles(targetPath, ig, projectPath);
        files.forEach(f => allFiles.add(f));
    }

    for (const file of allFiles) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            // Bỏ qua file binary (nếu đọc ra có null byte)
            if (content.indexOf('\0') !== -1) continue;

            totalTokens += enc.encode(content).length;
            totalFiles++;
        } catch (e) { /* Bỏ qua lỗi đọc file */ }
    }
    enc.free(); // Giải phóng bộ nhớ tiktoken
    return { tokens: totalTokens, files: totalFiles };
};

// 3. CRUD Group
export const createGroup = (projectPath, name) => {
    const data = loadData(projectPath);
    const group = { id: crypto.randomUUID(), name, paths: [], totalTokens: 0, totalFiles: 0 };
    data.groups.push(group);
    saveData(projectPath, data);
    return group;
};

export const deleteGroup = (projectPath, id) => {
    const data = loadData(projectPath);
    data.groups = data.groups.filter(g => g.id !== id);
    saveData(projectPath, data);
};

export const togglePathInGroup = (projectPath, groupId, targetPath, isAdd) => {
    const data = loadData(projectPath);
    const group = data.groups.find(g => g.id === groupId);
    if (!group) throw new Error("Không tìm thấy Group ID");

    if (isAdd && !group.paths.includes(targetPath)) group.paths.push(targetPath);
    if (!isAdd) group.paths = group.paths.filter(p => p !== targetPath);

    const stats = calculateTokens(projectPath, group.paths);
    group.totalTokens = stats.tokens;
    group.totalFiles = stats.files;

    saveData(projectPath, data);
    return group;
};
