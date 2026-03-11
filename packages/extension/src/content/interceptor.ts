// Script này chạy trong MAIN world để intercept fetch/XHR
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options] = args;
  
  if (typeof url === 'string' && url.includes('googleapis.com')) {
    const headers = options?.headers;
    let authHeader = null;
    
    if (headers) {
      if (headers instanceof Headers) {
        authHeader = headers.get('authorization') || headers.get('Authorization');
      } else if (typeof headers === 'object' && !Array.isArray(headers)) {
        const headersObj = headers as Record<string, string>;
        authHeader = headersObj['authorization'] || headersObj['Authorization'];
      }
    }
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      window.postMessage({ type: 'DRIVE_TOKEN_DETECTED', token }, '*');
    }
  }
  
  return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
const xhrHeaders = new WeakMap<XMLHttpRequest, Map<string, string>>();

XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('googleapis.com')) {
    xhrHeaders.set(this, new Map());
  }
  return originalOpen.apply(this, [method, url, ...rest] as any);
};

XMLHttpRequest.prototype.setRequestHeader = function(name: string, value: string) {
  const headers = xhrHeaders.get(this);
  
  if (headers) {
    headers.set(name.toLowerCase(), value);
    
    if (name.toLowerCase() === 'authorization' && value.startsWith('Bearer ')) {
      const token = value.replace('Bearer ', '');
      window.postMessage({ type: 'DRIVE_TOKEN_DETECTED', token }, '*');
    }
  }
  
  return originalSetRequestHeader.apply(this, [name, value]);
};
