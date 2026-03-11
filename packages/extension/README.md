# AI Studio Archiver - Chrome Extension

Chrome extension để export lịch sử chat từ Google AI Studio.

## Features

- 🔄 Tự động capture Drive API token
- 📝 Export chat sang Markdown hoặc ZIP
- 🧠 Hỗ trợ export thinking process
- 🖼️ Download ảnh và PDF từ Drive
- ✏️ Chỉnh sửa và xóa turns trước khi export
- 🔄 Khôi phục dữ liệu gốc

## Development

```bash
# Install dependencies
npm install

# Dev mode với hot reload
npm run dev

# Build extension
npm run build

# Lint
npm run lint
```

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
