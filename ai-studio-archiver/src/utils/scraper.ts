import type { ChatTurn } from '../types';

export function scrapeChatHistory(): ChatTurn[] {
  const chatTurns: ChatTurn[] = [];
  const turnElements = document.querySelectorAll('ms-chat-turn');

  turnElements.forEach((turnEl) => {
    const container = turnEl.querySelector('.chat-turn-container');
    if (!container) return;

    const isUser = container.classList.contains('user');
    const role = isUser ? 'user' : 'model';

    // Extract text content
    const textChunks = turnEl.querySelectorAll('ms-text-chunk');
    let content = '';
    textChunks.forEach((chunk) => {
      content += chunk.textContent?.trim() + '\n\n';
    });

    // Extract thinking process (Gemini 2.0)
    let thoughts = '';
    const thoughtChunk = turnEl.querySelector('ms-thought-chunk');
    if (thoughtChunk) {
      thoughts = thoughtChunk.textContent?.trim() || '';
    }

    // Extract file attachments
    const attachments: string[] = [];
    const fileChunks = turnEl.querySelectorAll('ms-file-chunk');
    fileChunks.forEach((fileChunk) => {
      const nameEl = fileChunk.querySelector('.name');
      if (nameEl) {
        attachments.push(nameEl.textContent?.trim() || '');
      }
    });

    chatTurns.push({
      role,
      content: content.trim(),
      thoughts: thoughts || undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    });
  });

  return chatTurns;
}
