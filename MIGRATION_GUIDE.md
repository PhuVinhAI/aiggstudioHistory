# Migration Guide - Monorepo Structure

## Tóm tắt thay đổi

Dự án đã được tái cấu trúc từ single package thành monorepo với 2 packages:
- `packages/extension`: Chrome Extension (code gốc)
- `packages/cli`: Rust CLI tool (mới)

## Thay đổi cho Developers

### 1. Clone và Setup

**Trước đây:**
```bash
git clone <repo>
npm install
npm run dev
```

**Bây giờ:**
```bash
git clone <repo>
npm install          # Install tất cả packages
npm run dev          # Dev extension
# hoặc
npm run build:cli    # Build CLI
```

### 2. Working Directory

**Extension development:**
```bash
# Từ root
npm run dev
npm run build

# Hoặc từ packages/extension
cd packages/extension
npm run dev
npm run build
```

**CLI development:**
```bash
cd packages/cli
cargo build
cargo run -- export --file-id "..." --token "..." --output "output.md"
```

### 3. File Paths

Tất cả extension code đã di chuyển vào `packages/extension/`:
- `src/` → `packages/extension/src/`
- `public/` → `packages/extension/public/`
- `dist/` → `packages/extension/dist/`
- `package.json` → `packages/extension/package.json`

### 4. Import Paths

**Không thay đổi!** Tất cả imports trong extension code vẫn giữ nguyên:
```typescript
import { useEditorStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
```

### 5. Build Output

Extension build output vẫn ở `packages/extension/dist/`

Load extension vào Chrome:
1. `npm run build`
2. Chrome → `chrome://extensions/`
3. Load unpacked → chọn `packages/extension/dist/`

### 6. Git Workflow

**Không thay đổi!** Git history được giữ nguyên.

```bash
git add .
git commit -m "Your message"
git push
```

## Lợi ích của Monorepo

1. **Tách biệt concerns:** Extension và CLI độc lập
2. **Shared code:** Có thể tạo `packages/shared` cho logic chung
3. **Parallel development:** Dev cả 2 packages cùng lúc
4. **Single CI/CD:** Build và test tất cả packages
5. **Consistent tooling:** Shared configs ở root level

## Troubleshooting

### Extension không build được

```bash
# Clean và reinstall
rm -rf node_modules packages/*/node_modules
npm install
npm run build
```

### CLI không compile được

```bash
cd packages/cli
cargo clean
cargo build
```

### Workspace errors

Đảm bảo package names đúng:
- Extension: `@ai-studio-archiver/extension`
- CLI: `ai-studio-archiver-cli`

## Next Steps

### Cho Extension
- ✅ Hoạt động bình thường
- ✅ Build thành công
- ✅ Tất cả features giữ nguyên

### Cho CLI
- [ ] Implement Drive API client
- [ ] Implement export logic
- [ ] Add tests
- [ ] Publish to crates.io

### Shared Package (Optional)
- [ ] Tạo `packages/shared` cho types chung
- [ ] Share export logic giữa extension và CLI
- [ ] TypeScript types cho Drive API
