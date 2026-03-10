import type { PromptData, ChatTurn } from '../types';

export async function fetchPromptDataFromDrive(promptId: string): Promise<PromptData | null> {
  try {
    const url = `https://drive.usercontent.google.com/download?id=${promptId}&export=download&confirm=t`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Drive download failed: ${response.status}`);
    }

    const data = await response.json();
    return data as PromptData;
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
    if (!chunk.text && !chunk.parts) continue;

    let content = '';
    let thoughts = '';

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

    if (content || thoughts) {
      chatTurns.push({
        role: chunk.role === 'user' ? 'user' : 'model',
        content: content.trim(),
        thoughts: thoughts.trim() || undefined
      });
    }
  }

  return chatTurns;
}

export function extractPromptIdFromUrl(url: string): string | null {
  const match = url.match(/\/prompts\/([^/?]+)/);
  return match ? match[1] : null;
}
