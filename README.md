# AI Studio Chat Archiver

Chrome Extension để xuất lịch sử chat từ Google AI Studio kèm file đính kèm.

## Tính năng

- Đánh chặp file upload (ảnh, PDF, text) khi người dùng tải lên AI Studio
- Xuất lịch sử chat dưới dạng Markdown hoặc ZIP
- Cấu hình bao gồm/loại trừ ảnh và PDF
- Lưu trữ tạm thời file trong 24 giờ
- Xử lý 100% client-side (không gửi dữ liệu ra ngoài)

## Cài đặt

1. Build extension:
```bash
npm install
npm run build
```

2. Load extension vào Chrome:
   - Mở `chrome://extensions/`
   - Bật "Developer mode"
   - Click "Load unpacked"
   - Chọn thư mục `dist`

## Sử dụng

1. Mở https://aistudio.google.com
2. Extension sẽ tự động đính kèm debugger (sẽ có thông báo)
3. Upload file và chat bình thường
4. Click nút "Export" ở góc trên để tải xuống lịch sử chat

## Cấu hình

Click vào icon extension để:
- Xem danh sách file đã lưu
- Bật/tắt bao gồm ảnh hoặc PDF trong export
- Xóa file đã lưu

## Cấu trúc dự án

```
src/
├── background/     # Service worker (đánh chặp upload)
├── content/        # UI injection (nút Export)
├── popup/          # Extension popup (cấu hình)
├── utils/          # Export & scraping logic
└── types/          # TypeScript types
```

## Công nghệ

- Vite + React + TypeScript
- CRXJS (Manifest V3)
- JSZip (đóng gói file)
- Lucide React (icons)
- Chrome Debugger API
