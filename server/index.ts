import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

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

  // Chạy lệnh kilo bằng spawn để log thẳng ra terminal hiện tại
  const kiloProcess = spawn('kilo', ['run', '--auto', prompt, '--print-logs'], {
    cwd: process.cwd(), // Chạy ngay tại thư mục gốc của project
    stdio: 'inherit',   // Kế thừa luồng I/O để in thẳng log ra console
    shell: true         // Dùng shell để tránh lỗi path trên môi trường Windows
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