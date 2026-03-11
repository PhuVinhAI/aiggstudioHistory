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
      .then(result => sendResponse({ success: true, data: result.data, mimeType: result.mimeType }))
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

async function downloadDriveFile(fileId: string, token?: string): Promise<{ data: string; mimeType: string }> {
  let url: string;
  let headers: Record<string, string> = {};
  let mimeType = 'application/octet-stream';

  if (token) {
    try {
      // Get file metadata first to know the MIME type
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType`;
      const metaResponse = await fetch(metaUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (metaResponse.ok) {
        const meta = await metaResponse.json();
        mimeType = meta.mimeType || mimeType;
      }
    } catch (error) {
      console.error('Failed to get file metadata:', error);
    }

    url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  // Try to get MIME type from response headers if not already set
  const contentType = response.headers.get('content-type');
  if (contentType && mimeType === 'application/octet-stream') {
    mimeType = contentType.split(';')[0].trim();
  }

  // Check if it's a text file
  const isText = mimeType.startsWith('text/') || 
                 mimeType.includes('javascript') ||
                 mimeType.includes('json') ||
                 mimeType.includes('xml');

  if (isText) {
    // For text files, get as text directly and return without base64 encoding
    const text = await response.text();
    return { data: text, mimeType };
  } else {
    // For binary files (images, PDFs)
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return { data: btoa(binary), mimeType };
  }
}

console.log('AI Studio Chat Archiver: Background service worker started');
