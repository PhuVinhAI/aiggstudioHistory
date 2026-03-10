import type { Vault } from '../types';

const VAULT_KEY = 'vault';
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

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
