import type { Vault } from '../types';

const VAULT_KEY = 'vault';
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'fetchPromptData') {
    fetchPromptDataFromDrive(request.promptId, request.token)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'downloadDriveFile') {
    downloadDriveFile(request.fileId, request.token)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function fetchPromptDataFromDrive(promptId: string, token?: string) {
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

  const url = `https://drive.usercontent.google.com/download?id=${promptId}&export=download&confirm=t`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Drive download failed: ${response.status}. File có thể cần token.`);
  }

  return await response.json();
}

async function downloadDriveFile(fileId: string, token?: string): Promise<string> {
  let url: string;
  let headers: Record<string, string> = {};

  if (token) {
    url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
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
}, 60 * 60 * 1000);

console.log('AI Studio Chat Archiver: Background service worker started');
