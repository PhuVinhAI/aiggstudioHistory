# Monorepo Structure

Dự án đã được tái cấu trúc thành monorepo với 2 packages:

## Cấu trúc thư mục

```
ai-studio-archiver/
├── packages/
│   ├── extension/              # Chrome Extension
│   │   ├── src/               # Source code
│   │   ├── public/            # Static assets
│   │   ├── dist/              # Build output
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   └── cli/                   # Rust CLI
│       ├── src/
│       │   └── main.rs
│       ├── Cargo.toml
│       └── README.md
│
├── package.json               # Root workspace config
├── .gitignore
└── README.md
```

## Packages

### 1. Extension (`packages/extension`)
- **Ngôn ngữ:** TypeScript + React
- **Build tool:** Vite
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Chức năng:** Chrome extension với UI đầy đủ để export chat

### 2. CLI (`packages/cli`)
- **Ngôn ngữ:** Rust
- **Framework:** Tokio (async runtime)
- **CLI parser:** Clap
- **Chức năng:** Command-line tool để export chat, phù hợp automation

## Commands

### Root level (từ thư mục gốc)

```bash
# Install dependencies
npm install

# Dev extension
npm run dev

# Build extension
npm run build

# Build CLI
npm run build:cli

# Lint extension
npm run lint
```

### Package level

```bash
# Extension
cd packages/extension
npm run dev
npm run build
npm run lint

# CLI
cd packages/cli
cargo build
cargo build --release
cargo run -- export --file-id "..." --token "..." --output "output.md"
```

## Workspace Configuration

Root `package.json` sử dụng npm workspaces:

```json
{
  "workspaces": ["packages/*"]
}
```

Mỗi package có `package.json` riêng với name scoped:
- `@ai-studio-archiver/extension`
- `ai-studio-archiver-cli`

## Migration Notes

### Đã di chuyển
- ✅ Toàn bộ extension code vào `packages/extension/`
- ✅ Tạo CLI skeleton trong `packages/cli/`
- ✅ Cập nhật workspace config
- ✅ Cập nhật .gitignore
- ✅ Tạo README cho từng package

### Giữ nguyên
- ✅ Toàn bộ functionality của extension
- ✅ Build process hoạt động bình thường
- ✅ Git history

### Cần làm tiếp (CLI)
- [ ] Implement Drive API client trong Rust
- [ ] Implement markdown export logic
- [ ] Implement ZIP export với images/PDFs
- [ ] Add tests
- [ ] Publish to crates.io (optional)

## Benefits của Monorepo

1. **Shared types:** Có thể tạo `packages/shared` cho types chung
2. **Consistent versioning:** Quản lý version tập trung
3. **Easier development:** Dev cả 2 packages cùng lúc
4. **Code reuse:** Logic export có thể share giữa extension và CLI
5. **Single CI/CD:** Build và test tất cả packages cùng lúc
