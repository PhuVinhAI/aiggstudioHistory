import type { ChatTurn } from '../types';

export function scrapeChatHistory(): ChatTurn[] {
  const chatTurns: ChatTurn[] = [];
  const turnElements = document.querySelectorAll('ms-chat-turn');

  turnElements.forEach((turnEl) => {
    const container = turnEl.querySelector('.chat-turn-container');
    if (!container) return;

    const isUser = container.classList.contains('user');
    const role = isUser ? 'user' : 'model';

    // Extract thinking process first (Gemini 2.0)
    let thoughts = '';
    const thoughtChunk = turnEl.querySelector('ms-thought-chunk');
    if (thoughtChunk) {
      // Get only the text chunks inside thought chunk
      const thoughtTextChunks = thoughtChunk.querySelectorAll('ms-text-chunk');
      thoughtTextChunks.forEach((chunk) => {
        thoughts += chunk.textContent?.trim() + '\n\n';
      });
      thoughts = thoughts.trim();
    }

    // Extract text content (excluding thought chunks)
    const promptChunks = turnEl.querySelectorAll('ms-prompt-chunk');
    let content = '';
    promptChunks.forEach((promptChunk) => {
      // Skip if this is inside a thought chunk
      if (promptChunk.closest('ms-thought-chunk')) return;
      
      const textChunks = promptChunk.querySelectorAll('ms-text-chunk');
      textChunks.forEach((chunk) => {
        content += chunk.textContent?.trim() + '\n\n';
      });
    });

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
