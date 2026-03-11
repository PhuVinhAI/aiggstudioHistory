# AI Studio Archiver - Monorepo

Export và quản lý lịch sử chat từ Google AI Studio.

## Cấu trúc dự án

```
ai-studio-archiver/
├── packages/
│   ├── extension/     # Chrome Extension (TypeScript + React)
│   └── cli/          # CLI Tool (Rust)
├── package.json      # Root workspace config
└── README.md
```

## Packages

### Extension (Chrome Extension)
Chrome extension để export chat history từ Google AI Studio với UI đầy đủ.

**Tech stack:** TypeScript, React, Vite, Tailwind CSS, shadcn/ui

**Xem thêm:** [packages/extension/README.md](packages/extension/README.md)

### CLI (Command Line Tool)
CLI tool để export chat history từ terminal, phù hợp cho automation và scripting.

**Tech stack:** Rust, Tokio, Clap

**Xem thêm:** [packages/cli/README.md](packages/cli/README.md)

## Development

### Prerequisites
- Node.js 18+
- npm hoặc pnpm
- Rust 1.70+ (cho CLI)

### Setup

```bash
# Install dependencies
npm install

# Dev extension
npm run dev

# Build extension
npm run build

# Build CLI
npm run build:cli
```

### Workspace Commands

```bash
# Run command trong extension package
npm run dev -w extension
npm run build -w extension

# Build CLI
cd packages/cli && cargo build --release
```

## License

MIT
