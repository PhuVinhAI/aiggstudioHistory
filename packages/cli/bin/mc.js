#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'child_process';
import { loadData, createGroup, deleteGroup, togglePathInGroup } from '../src/core.js';
import { exportGroup } from '../src/exporter.js';

const program = new Command();
program
    .name('mc')
    .description('Master Context - Quản lý ngữ cảnh siêu nhẹ cho AI (Node.js Edition)')
    .version('1.0.0')
    .option('-p, --path <path>', 'Đường dẫn dự án', process.cwd());

// Lệnh: mc group
const groupCmd = program.command('group').description('Quản lý Group');

groupCmd.command('list').action(() => {
    const opts = program.opts();
    const data = loadData(opts.path);
    console.log("📂 Danh sách Group trong dự án:");
    if (data.groups.length === 0) console.log("  (Chưa có group nào)");
    data.groups.forEach(g => {
        console.log(`- [${g.id}] ${g.name} (Files: ${g.totalFiles}, Tokens: ${g.totalTokens})`);
        g.paths.forEach(p => console.log(`   └─ ${p}`));
    });
});

groupCmd.command('create').requiredOption('-n, --name <name>').action((cmd) => {
    const g = createGroup(program.opts().path, cmd.name);
    console.log(`✅ Đã tạo Group: ${g.name} (ID: ${g.id})`);
});

groupCmd.command('delete').requiredOption('-i, --id <id>').action((cmd) => {
    deleteGroup(program.opts().path, cmd.id);
    console.log(`✅ Đã xóa Group: ${cmd.id}`);
});

groupCmd.command('add').requiredOption('-i, --id <id>').requiredOption('-f, --file <file>').action((cmd) => {
    console.log("⏳ Đang quét và đếm token...");
    try {
        const g = togglePathInGroup(program.opts().path, cmd.id, cmd.file, true);
        console.log(`✅ Đã thêm '${cmd.file}'. Group hiện tại: ${g.totalFiles} files, ${g.totalTokens} tokens.`);
    } catch (e) { console.error(`❌ Lỗi: ${e.message}`); }
});

groupCmd.command('remove').requiredOption('-i, --id <id>').requiredOption('-f, --file <file>').action((cmd) => {
    console.log("⏳ Đang tính toán lại token...");
    try {
        const g = togglePathInGroup(program.opts().path, cmd.id, cmd.file, false);
        console.log(`✅ Đã xóa '${cmd.file}'. Group còn lại: ${g.totalFiles} files, ${g.totalTokens} tokens.`);
    } catch (e) { console.error(`❌ Lỗi: ${e.message}`); }
});

// Lệnh: mc export
program.command('export')
    .requiredOption('-i, --id <id>', 'ID của group')
    .requiredOption('-o, --out <out>', 'Đường dẫn file lưu')
    .option('--no-comments', 'Xóa comments')
    .option('--no-logs', 'Xóa logs')
    .option('--line-numbers', 'Thêm số dòng')
    .action((cmd) => {
        console.log("⏳ Đang tổng hợp Context...");
        try {
            exportGroup(program.opts().path, cmd.id, cmd.out, cmd);
            console.log(`✅ Đã lưu file context tại: ${cmd.out}`);
        } catch (e) { console.error(`❌ Lỗi xuất file: ${e.message}`); }
    });

// Lệnh: mc git-diff
program.command('git-diff').requiredOption('-c, --commit <sha>').action((cmd) => {
    try {
        const diff = execSync(`git show --patch ${cmd.commit}`, { cwd: program.opts().path, encoding: 'utf-8' });
        console.log(diff);
    } catch (e) {
        console.error("❌ Lỗi gọi lệnh git. Hãy chắc chắn đây là git repo và commit đúng.");
    }
});

program.parse(process.argv);
