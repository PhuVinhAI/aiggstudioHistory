import type { PromptData, ChatTurn } from '../types';

export async function fetchPromptDataFromDrive(promptId: string, token?: string): Promise<PromptData | null> {
  try {
    // Use background script to avoid CORS
    const response = await chrome.runtime.sendMessage({
      action: 'fetchPromptData',
      promptId,
      token
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data as PromptData;
  } catch (error) {
    console.error('Failed to fetch prompt data from Drive:', error);
    return null;
  }
}

export function cleanPromptData(data: PromptData): any {
  // Chỉ giữ lại thông tin cần thiết
  const cleaned = {
    model: data.runSettings?.model || 'unknown',
    temperature: data.runSettings?.temperature,
    systemInstruction: data.systemInstruction,
    conversation: [] as any[]
  };

  // Xử lý chunks
  for (const chunk of data.chunkedPrompt.chunks) {
    if (!chunk.text && !chunk.parts) continue;

    const message: any = {
      role: chunk.role,
      content: ''
    };

    // Lấy nội dung
    if (chunk.parts) {
      const textParts = chunk.parts.filter(p => !p.thought);
      const thoughtParts = chunk.parts.filter(p => p.thought);
      
      message.content = textParts.map(p => p.text).join('');
      
      if (thoughtParts.length > 0) {
        message.thinking = thoughtParts.map(p => p.text).join('');
      }
    } else if (chunk.text) {
      if (chunk.isThought) {
        message.thinking = chunk.text;
      } else {
        message.content = chunk.text;
      }
    }

    // Chỉ thêm nếu có nội dung
    if (message.content || message.thinking) {
      cleaned.conversation.push(message);
    }
  }

  return cleaned;
}

export function convertPromptDataToChatTurns(data: PromptData): ChatTurn[] {
  const chatTurns: ChatTurn[] = [];
  const chunks = data.chunkedPrompt.chunks;

  for (const chunk of chunks) {
    // Skip empty chunks
    if (!chunk.text && !chunk.parts && !chunk.inlineFile && !chunk.driveDocument && !chunk.driveImage) continue;

    let content = '';
    let thoughts = '';
    const attachments: string[] = [];

    // Handle inline file
    if (chunk.inlineFile) {
      const filename = `inline_file.${chunk.inlineFile.mimeType.split('/')[1] || 'txt'}`;
      attachments.push(filename);
      // Decode base64 content if it's text
      if (chunk.inlineFile.mimeType.startsWith('text/')) {
        try {
          content = atob(chunk.inlineFile.data);
        } catch {
          content = `[File: ${filename}]`;
        }
      }
    }

    // Handle Drive document
    if (chunk.driveDocument) {
      attachments.push(`drive_doc_${chunk.driveDocument.id}`);
    }

    // Handle Drive image
    if (chunk.driveImage) {
      attachments.push(`drive_image_${chunk.driveImage.id}`);
    }

    // Handle text and thoughts
    if (chunk.parts) {
      for (const part of chunk.parts) {
        if (part.thought) {
          thoughts += part.text;
        } else {
          content += part.text;
        }
      }
    } else if (chunk.text) {
      if (chunk.isThought) {
        thoughts = chunk.text;
      } else {
        content = chunk.text;
      }
    }

    if (content || thoughts || attachments.length > 0) {
      chatTurns.push({
        role: chunk.role === 'user' ? 'user' : 'model',
        content: content.trim(),
        thoughts: thoughts.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });
    }
  }

  return chatTurns;
}

export function extractPromptIdFromUrl(url: string): string | null {
  const match = url.match(/\/prompts\/([^/?]+)/);
  return match ? match[1] : null;
}
