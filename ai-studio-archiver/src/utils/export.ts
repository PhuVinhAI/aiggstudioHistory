import JSZip from 'jszip';
import type { ChatTurn, ExportConfig, Vault } from '../types';

export async function exportChat(
  chatTurns: ChatTurn[],
  vault: Vault,
  config: ExportConfig
): Promise<void> {
  const hasMedia = chatTurns.some(turn => 
    turn.attachments?.some(filename => {
      const data = vault[filename];
      if (!data) return false;
      const isImage = data.mimeType.startsWith('image/');
      const isPDF = data.mimeType === 'application/pdf';
      return (isImage && config.includeImages) || (isPDF && config.includePDFs);
    })
  );

  if (hasMedia) {
    await exportAsZip(chatTurns, vault, config);
  } else {
    await exportAsMarkdown(chatTurns, vault);
  }
}

async function exportAsMarkdown(chatTurns: ChatTurn[], vault: Vault): Promise<void> {
  let markdown = `# Lịch sử chat: AI Studio\n\n`;
  markdown += `Xuất lúc: ${new Date().toLocaleString('vi-VN')}\n\n---\n\n`;

  for (const turn of chatTurns) {
    markdown += `## ${turn.role === 'user' ? 'User' : 'Model'}:\n\n`;
    
    if (turn.content) {
      markdown += `${turn.content}\n\n`;
    }

    if (turn.thoughts) {
      markdown += `<details>\n<summary>Thinking Process</summary>\n\n${turn.thoughts}\n\n</details>\n\n`;
    }

    if (turn.attachments && turn.attachments.length > 0) {
      markdown += `**Đính kèm:**\n`;
      for (const filename of turn.attachments) {
        const data = vault[filename];
        if (data && data.mimeType.startsWith('text/')) {
          // Include text file content
          const content = base64ToText(data.base64);
          markdown += `\n### ${filename}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        } else {
          markdown += `- ${filename} (Không bao gồm trong bản tải này)\n`;
        }
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  downloadFile(markdown, `chat_export_${getTimestamp()}.md`, 'text/markdown');
}

async function exportAsZip(
  chatTurns: ChatTurn[],
  vault: Vault,
  config: ExportConfig
): Promise<void> {
  const zip = new JSZip();
  
  // Create markdown content
  let markdown = `# Lịch sử chat: AI Studio\n\n`;
  markdown += `Xuất lúc: ${new Date().toLocaleString('vi-VN')}\n\n---\n\n`;

  for (const turn of chatTurns) {
    markdown += `## ${turn.role === 'user' ? 'User' : 'Model'}:\n\n`;
    
    if (turn.content) {
      markdown += `${turn.content}\n\n`;
    }

    if (turn.thoughts) {
      markdown += `<details>\n<summary>Thinking Process</summary>\n\n${turn.thoughts}\n\n</details>\n\n`;
    }

    if (turn.attachments && turn.attachments.length > 0) {
      markdown += `**Đính kèm:**\n`;
      for (const filename of turn.attachments) {
        const data = vault[filename];
        if (!data) {
          markdown += `- ${filename} (Không tìm thấy)\n`;
          continue;
        }

        const isImage = data.mimeType.startsWith('image/');
        const isPDF = data.mimeType === 'application/pdf';
        const isText = data.mimeType.startsWith('text/');

        if (isImage && config.includeImages) {
          const path = `assets/images/${filename}`;
          zip.file(path, base64ToBlob(data.base64, data.mimeType));
          markdown += `- ![${filename}](${path})\n`;
        } else if (isPDF && config.includePDFs) {
          const path = `assets/documents/${filename}`;
          zip.file(path, base64ToBlob(data.base64, data.mimeType));
          markdown += `- [${filename}](${path})\n`;
        } else if (isText) {
          const content = base64ToText(data.base64);
          markdown += `\n### ${filename}\n\`\`\`\n${content}\n\`\`\`\n\n`;
        } else {
          markdown += `- ${filename} (Không bao gồm)\n`;
        }
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  zip.file('chat_log.md', markdown);

  // Generate zip
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadFile(blob, `chat_export_${getTimestamp()}.zip`, 'application/zip');
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function base64ToText(base64: string): string {
  try {
    return atob(base64);
  } catch {
    return '[Unable to decode content]';
  }
}

function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}
