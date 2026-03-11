# AI Studio Archiver CLI

CLI tool để export lịch sử chat từ Google AI Studio.

## Installation

```bash
cargo install --path .
```

## Usage

```bash
# Export chat history
ai-studio-archiver-cli export \
  --file-id "YOUR_DRIVE_FILE_ID" \
  --token "YOUR_DRIVE_TOKEN" \
  --output "chat_export.md"
```

## Development

```bash
# Build
cargo build

# Run
cargo run -- export --file-id "..." --token "..." --output "output.md"

# Build release
cargo build --release
```
