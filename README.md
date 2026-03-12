# AI Studio Archiver - Chrome Extension

Chrome extension để export lịch sử chat từ Google AI Studio và tự động hóa việc cập nhật mã nguồn (Auto-Kilo).

## Features

- 🔄 Tự động capture Drive API token
- 📝 Export chat sang Markdown hoặc ZIP
- 🧠 Hỗ trợ export thinking process
- 🖼️ Download ảnh và PDF từ Drive
- ✏️ Chỉnh sửa và xóa turns trước khi export
- 🤖 **Auto-Watch Kilo:** Tự động phát hiện AI trả lời xong, bóc tách `SEARCH/REPLACE` block và gửi cho Kilo CLI chạy ngầm.
- 🔔 **In-App Toast Notifications:** Thông báo trạng thái xử lý trực tiếp trên giao diện AI Studio để không bị chặn bởi chế độ Do Not Disturb của HĐH.

## Development

```bash
# Install dependencies
npm install

# Dev mode với hot reload
npm run dev

# Khởi chạy Local Server kết nối với Kilo CLI (Port 9999)
npm run server

# Build extension
npm run build

# Lint
npm run lint
```

## Hướng dẫn sử dụng Auto-Kilo

1. Mở terminal tại thư mục code của bạn, chạy lệnh `npm run server` để bật cầu nối.
2. Cài đặt và bật Extension, nhấn vào Popup và bật tính năng **"Auto-Watch Kilo"**.
3. Yêu cầu AI (trong Google AI Studio) sinh code theo chuẩn block `<<<START OF DIFF>>>`.
4. Ngay khi AI trả lời xong, Extension sẽ tự báo cho Server áp dụng thay đổi vào mã nguồn cục bộ.

## Load Extension vào Chrome

1. Build extension: `npm run build`
2. Mở Chrome và vào `chrome://extensions/`
3. Bật "Developer mode"
4. Click "Load unpacked"
5. Chọn thư mục `dist/`

## Tech Stack

- TypeScript
- React 19
- Vite
- Tailwind CSS 4
- shadcn/ui
- Zustand (state management)
- JSZip (export ZIP)
