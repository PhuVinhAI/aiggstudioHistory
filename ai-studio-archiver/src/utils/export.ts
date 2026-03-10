import JSZip from 'jszip';
import type { ChatTurn, ExportConfig } from '../types';

export async function exportChat(
  chatTurns: ChatTurn[],
  config: ExportConfig,
  driveToken?: string
): Promise<void> {
  // Check if we have any Drive files
  const hasDriveFiles = chatTurns.some(turn => 
    turn.attachments?.some(filename => 
      filename.startsWith('drive_doc_') || filename.startsWith('drive_image_')
    )
  );

  if (hasDriveFiles && config.includeImages) {
    await exportAsZip(chatTurns, config, driveToken);
  } else {
    await exportAsMarkdown(chatTurns);
  }
}

async function exportAsMarkdown(chatTurns: ChatTurn[]): Promise<void> {
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
        if (filename.startsWith('drive_doc_') || filename.startsWith('drive_image_')) {
          const driveId = filename.replace('drive_doc_', '').replace('drive_image_', '');
          const type = filename.startsWith('drive_doc_') ? 'Document' : 'Image';
          markdown += `- [${type} on Drive](https://drive.google.com/file/d/${driveId}/view)\n`;
        } else {
          markdown += `- ${filename}\n`;
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
  config: ExportConfig,
  driveToken?: string
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
        if (filename.startsWith('drive_doc_')) {
          const driveId = filename.replace('drive_doc_', '');
          if (config.includePDFs) {
            try {
              const fileBlob = await downloadFromDrive(driveId, driveToken);
              const path = `assets/documents/${driveId}.pdf`;
              zip.file(path, fileBlob);
              markdown += `- [Document](${path})\n`;
            } catch (error) {
              console.error('Failed to download document:', error);
              markdown += `- [Document on Drive](https://drive.google.com/file/d/${driveId}/view)\n`;
            }
          } else {
            markdown += `- [Document on Drive](https://drive.google.com/file/d/${driveId}/view)\n`;
          }
        } else if (filename.startsWith('drive_image_')) {
          const driveId = filename.replace('drive_image_', '');
          if (config.includeImages) {
            try {
              const fileBlob = await downloadFromDrive(driveId, driveToken);
              const path = `assets/images/${driveId}.jpg`;
              zip.file(path, fileBlob);
              markdown += `- ![Image](${path})\n`;
            } catch (error) {
              console.error('Failed to download image:', error);
              markdown += `- [Image on Drive](https://drive.google.com/file/d/${driveId}/view)\n`;
            }
          } else {
            markdown += `- [Image on Drive](https://drive.google.com/file/d/${driveId}/view)\n`;
          }
        } else {
          markdown += `- ${filename}\n`;
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

async function downloadFromDrive(fileId: string, token?: string): Promise<Blob> {
  // Send message to background script to download
  const response = await chrome.runtime.sendMessage({
    action: 'downloadDriveFile',
    fileId,
    token
  });

  if (!response.success) {
    throw new Error(response.error);
  }

  // Convert base64 to blob
  const byteCharacters = atob(response.data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray]);
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
