import type { Vault } from '../types';

const VAULT_KEY = 'vault';
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'fetchPromptData') {
    fetchPromptDataFromDrive(request.promptId, request.token)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function fetchPromptDataFromDrive(promptId: string, token?: string) {
  // Try with token first if provided
  if (token) {
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${promptId}?alt=media`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed with token, trying without:', error);
    }
  }

  // Try without token (public file)
  const url = `https://drive.usercontent.google.com/download?id=${promptId}&export=download&confirm=t`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Drive download failed: ${response.status}. File có thể cần token.`);
  }

  return await response.json();
}

// Cleanup old files periodically
setInterval(async () => {
  const result = await chrome.storage.local.get(VAULT_KEY);
  const vault: Vault = (result[VAULT_KEY] as Vault) || {};
  const now = Date.now();
  let hasChanges = false;

  for (const [filename, data] of Object.entries(vault)) {
    if (now - data.timestamp > CLEANUP_INTERVAL) {
      delete vault[filename];
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await chrome.storage.local.set({ [VAULT_KEY]: vault });
    console.log('Cleaned up old files from vault');
  }
}, 60 * 60 * 1000); // Check every hour

console.log('AI Studio Chat Archiver: Background service worker started');
