import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { loadData } from './core.js';

// Regex an toàn (dùng negative lookbehind (?<!:) để không xóa nhầm http://)
const REGEX_C_COMMENT = /(?<!:)\/\/.*|\/\*[\s\S]*?\*\//g;
const REGEX_HASH_COMMENT = /^\s*#.*$/gm;
const REGEX_HTML_COMMENT = /<!--[\s\S]*?-->/g;
const REGEX_LOGS = /^\s*(console\.(log|warn|error|info|debug)|print|println!)\s*\(.*?\);?\s*$/gm;

export const exportGroup = (projectPath, groupId, outPath, options) => {
    const data = loadData(projectPath);
    const group = data.groups.find(g => g.id === groupId);
    if (!group) throw new Error("Group không tồn tại");

    const ig = ignore();
    const gitignorePath = path.join(projectPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) ig.add(fs.readFileSync(gitignorePath, 'utf8'));

    let finalContent = `CONTEXT TỪ GROUP: ${group.name}\n`;
    finalContent += `================================================\n\n`;

    const getFiles = (dir) => {
        let results = [];
        if (!fs.existsSync(dir)) return results;
        if (fs.statSync(dir).isFile()) return [dir];
        fs.readdirSync(dir).forEach(file => {
            if (file === '.git' || file === 'node_modules') return;
            const full = path.join(dir, file);
            const rel = path.relative(projectPath, full);
            if (!ig.ignores(rel)) {
                if (fs.statSync(full).isDirectory()) results = results.concat(getFiles(full));
                else results.push(full);
            }
        });
        return results;
    };

    const allFiles = new Set();
    group.paths.forEach(p => getFiles(path.join(projectPath, p)).forEach(f => allFiles.add(f)));

    for (const file of allFiles) {
        try {
            let content = fs.readFileSync(file, 'utf-8');
            if (content.indexOf('\0') !== -1) continue; // Skip binary

            const ext = path.extname(file).toLowerCase();
            const relPath = path.relative(projectPath, file);

            if (options.noLogs) content = content.replace(REGEX_LOGS, '');
            if (options.noComments) {
                if (['.js', '.ts', '.jsx', '.tsx', '.c', '.cpp', '.java', '.cs', '.go', '.rs'].includes(ext)) {
                    content = content.replace(REGEX_C_COMMENT, '');
                } else if (['.py', '.sh', '.yaml', '.yml', '.rb'].includes(ext)) {
                    content = content.replace(REGEX_HASH_COMMENT, '');
                } else if (['.html', '.xml', '.vue'].includes(ext)) {
                    content = content.replace(REGEX_HTML_COMMENT, '');
                }
                // Xóa dòng trống thừa
                content = content.split('\n').filter(line => line.trim().length > 0).join('\n');
            }

            finalContent += `--- FILE: ${relPath} ---\n`;
            if (options.lineNumbers) {
                const lines = content.split('\n');
                finalContent += lines.map((l, i) => `${String(i + 1).padStart(4, ' ')} | ${l}`).join('\n') + '\n';
            } else {
                finalContent += content + '\n';
            }
            finalContent += '\n';

        } catch (e) { /* skip */ }
    }

    fs.writeFileSync(outPath, finalContent);
};
