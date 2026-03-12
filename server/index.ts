import express from 'express';
import cors from 'cors';
import { spawn, execSync } from 'child_process';
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
  console.log(`Nhiệm vụ: ${prompt}\n`);

  // Tránh lỗi multiline prompt bị cắt ngang trên terminal bằng cách tắt shell.
  // Trên Windows, khi không dùng shell, ta phải gọi đích danh file .cmd
  const isWindows = os.platform() === 'win32';
  let command = isWindows ? 'kilo.cmd' : 'kilo';
  let args = ['run', '--auto', prompt, '--print-logs'];

  // Workaround cho lỗi `EINVAL` trên Node 18+ khi truyền chuỗi có newline vào file .cmd:
  // Chúng ta tìm file .js gốc của Kilo để chạy trực tiếp qua `node` thay vì gọi qua .cmd wrapper.
  if (isWindows) {
    try {
      const kiloCmdPath = execSync('where kilo', { encoding: 'utf8' }).split('\n')[0].trim();
      if (kiloCmdPath && kiloCmdPath.toLowerCase().endsWith('.cmd')) {
        const content = fs.readFileSync(kiloCmdPath, 'utf8');
        // Trích xuất đường dẫn file thực thi từ file .cmd do npm/yarn/pnpm sinh ra
        const match = content.match(/"([^"]+\.(?:js|cjs|mjs))"/i);
        if (match) {
          let jsPath = match[1];
          // Replace biến môi trường nội bộ của windows cmd
          jsPath = jsPath.replace(/%~dp0/gi, path.dirname(kiloCmdPath) + path.sep);
          jsPath = jsPath.replace(/%dp0%/gi, path.dirname(kiloCmdPath) + path.sep);
          jsPath = path.resolve(jsPath);
          
          if (fs.existsSync(jsPath)) {
            command = 'node';
            args = [jsPath, 'run', '--auto', prompt, '--print-logs'];
          }
        }
      }
    } catch (err) {
      console.warn('\n[CẢNH BÁO] Không thể phân tích kilo.cmd, chuyển về mặc định:', err);
    }
  }

  // Chạy lệnh kilo bằng spawn để log thẳng ra terminal hiện tại
  const kiloProcess = spawn(command, args, {
    cwd: process.cwd(), // Chạy ngay tại thư mục gốc của project
    stdio: 'inherit',   // Kế thừa luồng I/O để in thẳng log ra console
    shell: false        // Quan trọng: Tắt shell để Node.js tự escape an toàn chuỗi nhiều dòng
  });

  kiloProcess.on('error', (err) => {
    console.error(`\n[LỖI] Không thể khởi chạy Kilo CLI:`, err);
  });

  kiloProcess.on('close', (code) => {
    console.log(`\n[THÔNG BÁO] Kilo CLI đã hoàn thành với mã thoát (exit code): ${code}\n`);
  });

  // Trả về response ngay lập tức để UI không bị treo chờ Kilo chạy xong
  res.json({ success: true, message: 'Đã kích hoạt Kilo CLI thành công' });
});

app.listen(9999, () => {
  console.log('🚀 Server kết nối Kilo CLI đang chạy tại: http://localhost:9999');
  console.log('⏳ Đang chờ nhiệm vụ từ Extension...');
});