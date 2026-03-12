import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/kilo', (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Vui lòng cung cấp nội dung prompt' });
  }

  console.log(`\n=================================================`);
  console.log(`🤖 KILO CLI ĐƯỢC GỌI TỪ EXTENSION`);
  console.log(`=================================================`);

  const isWindows = os.platform() === 'win32';
  const command = isWindows ? 'kilo.cmd' : 'kilo';

  // Lưu prompt (chứa code diff nhiều dòng) vào file tạm
  const tempFileName = `kilo_task_${Date.now()}.txt`;
  const tempFilePath = path.join(process.cwd(), tempFileName);

  try {
    fs.writeFileSync(tempFilePath, prompt, 'utf8');
    console.log(`[THÔNG BÁO] Đã lưu nội dung task vào file tạm: ${tempFileName}`);
  } catch (err) {
    console.error('Lỗi tạo file tạm:', err);
    return res.status(500).json({ error: 'Không thể tạo file tạm cho Kilo' });
  }

  // Kilo là AI nên ta chỉ cần bảo nó đọc file là nó sẽ tự động lấy nhiệm vụ (SEARCH/REPLACE)
  const shortPrompt = `Vui lòng đọc và áp dụng chính xác các thay đổi mã nguồn từ file sau: ${tempFilePath}`;

  let kiloProcess;

  if (isWindows) {
    // Đã xóa --print-logs để Kilo chạy sạch sẽ, không in log hệ thống
    const commandString = `kilo run --auto "${shortPrompt}"`;
    kiloProcess = spawn('cmd.exe', ['/c', commandString], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false
    });
  } else {
    const args = ['run', '--auto', shortPrompt];
    kiloProcess = spawn(command, args, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: false
    });
  }

  kiloProcess.on('error', (err) => {
    console.error(`\n[LỖI] Không thể khởi chạy Kilo CLI:`, err);
  });

  kiloProcess.on('close', (code) => {
    console.log(`\n[THÔNG BÁO] Kilo CLI đã hoàn thành với mã thoát (exit code): ${code}\n`);
    // Dọn dẹp file tạm
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`[THÔNG BÁO] Đã dọn dẹp file tạm: ${tempFileName}`);
      }
    } catch (e) {
      console.warn(`[CẢNH BÁO] Không thể xóa file tạm: ${tempFileName}`);
    }
  });

  // QUAN TRỌNG: Trả về response cho Extension ngay lập tức.
  // Nhờ vậy Popup không bị loading mãi và Background không bị treo.
  res.json({ success: true, message: 'Đã đưa task cho Kilo xử lý ngầm' });
});

app.listen(9999, () => {
  console.log('🚀 Server kết nối Kilo CLI đang chạy tại: http://localhost:9999');
  console.log('⏳ Đang chờ nhiệm vụ từ Extension...');
});
