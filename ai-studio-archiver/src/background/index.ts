import type { Vault } from '../types';

const VAULT_KEY = 'vault';
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Track debugger attachments
const attachedTabs = new Set<number>();

// Listen for tab updates to attach debugger
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('aistudio.google.com')) {
    attachDebugger(tabId);
  }
});

// Listen for tab removal to detach debugger
chrome.tabs.onRemoved.addListener((tabId) => {
  if (attachedTabs.has(tabId)) {
    detachDebugger(tabId);
  }
});

async function attachDebugger(tabId: number) {
  if (attachedTabs.has(tabId)) return;

  try {
    await chrome.debugger.attach({ tabId }, '1.3');
    await chrome.debugger.sendCommand({ tabId }, 'Network.enable');
    attachedTabs.add(tabId);
    console.log(`Debugger attached to tab ${tabId}`);
  } catch (error) {
    console.error('Failed to attach debugger:', error);
  }
}

async function detachDebugger(tabId: number) {
  try {
    await chrome.debugger.detach({ tabId });
    attachedTabs.delete(tabId);
    console.log(`Debugger detached from tab ${tabId}`);
  } catch (error) {
    console.error('Failed to detach debugger:', error);
  }
}

// Listen for network events
chrome.debugger.onEvent.addListener((_source, method, params: any) => {
  if (method === 'Network.requestWillBeSent') {
    const url = params.request?.url || '';
    
    if (url.includes('content.googleapis.com/upload/drive/v3/files') && 
        params.request?.method === 'POST') {
      handleFileUpload(params.request);
    }
  }
});

async function handleFileUpload(request: any) {
  try {
    const postData = request.postData;
    if (!postData) return;

    // Parse multipart data
    const { filename, base64, mimeType } = parseMultipartData(postData);
    
    if (filename && base64) {
      await saveToVault(filename, base64, mimeType);
      console.log(`Captured file: ${filename}`);
    }
  } catch (error) {
    console.error('Failed to handle file upload:', error);
  }
}

function parseMultipartData(postData: string): { filename: string; base64: string; mimeType: string } {
  let filename = '';
  let base64 = '';
  let mimeType = '';

  // Extract filename from JSON part
  const nameMatch = postData.match(/"name"\s*:\s*"([^"]+)"/);
  if (nameMatch) {
    filename = nameMatch[1];
  }

  // Extract mimeType
  const mimeMatch = postData.match(/"mimeType"\s*:\s*"([^"]+)"/);
  if (mimeMatch) {
    mimeType = mimeMatch[1];
  }

  // Extract base64 content
  const base64Match = postData.match(/Content-Transfer-Encoding:\s*base64\s+([A-Za-z0-9+/=\s]+)/);
  if (base64Match) {
    base64 = base64Match[1].replace(/\s/g, '');
  }

  return { filename, base64, mimeType };
}

async function saveToVault(filename: string, base64: string, mimeType: string) {
  const result = await chrome.storage.local.get(VAULT_KEY);
  const vault: Vault = (result[VAULT_KEY] as Vault) || {};

  vault[filename] = {
    base64,
    mimeType,
    timestamp: Date.now()
  };

  await chrome.storage.local.set({ [VAULT_KEY]: vault });
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
