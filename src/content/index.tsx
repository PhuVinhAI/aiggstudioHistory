// Auto-Watch Kilo Logic
let isGenerating = false;
let autoWatchEnabled = false;

// Content script chạy trong ISOLATED world - có thể dùng chrome.storage
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'DRIVE_TOKEN_DETECTED') {
    const token = event.data.token;
    
    chrome.storage.local.get(['driveToken'], (result) => {
      const currentToken = result.driveToken as string | undefined;
      
      if (currentToken !== token) {
        chrome.storage.local.set({ driveToken: token });
      }
    });
  }

  // Bắt tín hiệu Network từ interceptor.ts
  if (event.data.type === 'AI_STATE_CHANGED') {
    if (!autoWatchEnabled) return;

    if (event.data.state === 'generating') {
      if (!isGenerating) {
        isGenerating = true;
        console.log('🔄 [Auto-watch Debug] Network Event: Đã bắt được GenerateContent. AI đang trả lời...');
      }
    } else if (event.data.state === 'updated') {
      if (isGenerating) {
        isGenerating = false;
        console.log('✅ [Auto-watch Debug] Network Event: Đã bắt được Update/CreatePrompt. Dữ liệu đã lưu lên Drive.');
        
        // Gọi thẳng sau 1 giây mà không cần đợi 6 giây như trước (do đã update xong)
        setTimeout(() => {
          console.log('🚀 [Auto-watch Debug] Bắn tín hiệu executeKiloWorkflow tới Background!');
          chrome.runtime.sendMessage({ 
            action: 'executeKiloWorkflow', 
            url: window.location.href 
          });
        }, 1000);
      }
    }
  }
});

// Khởi tạo trạng thái ban đầu
chrome.storage.local.get(['autoWatchKilo'], (res) => {
  autoWatchEnabled = !!res.autoWatchKilo;
  console.log(`⚙️ [Auto-watch Debug] Trạng thái khởi tạo: ${autoWatchEnabled ? 'BẬT' : 'TẮT'}`);
});

// Lắng nghe nếu người dùng bật/tắt trong Popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoWatchKilo) {
    autoWatchEnabled = !!changes.autoWatchKilo.newValue;
    console.log(`⚙️ [Auto-watch Debug] Đã thay đổi trạng thái: ${autoWatchEnabled ? 'BẬT' : 'TẮT'}`);
  }
});

// Lắng nghe yêu cầu hiển thị Toast Notifications từ Background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'SHOW_NOTIFICATION') {
    showToast(request.title, request.message, request.type);
  }
});

function showToast(title: string, message: string, type: 'info' | 'error' | 'success' = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.padding = '16px 20px';
  toast.style.backgroundColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
  toast.style.color = 'white';
  toast.style.borderRadius = '12px';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  toast.style.zIndex = '99999999';
  toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  toast.style.minWidth = '300px';
  toast.style.maxWidth = '400px';
  toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  toast.style.transform = 'translateY(100px) scale(0.9)';
  toast.style.opacity = '0';
  toast.style.lineHeight = '1.5';

  const titleEl = document.createElement('div');
  titleEl.style.fontWeight = '600';
  titleEl.style.fontSize = '15px';
  titleEl.style.marginBottom = '4px';
  titleEl.textContent = title;

  const msgEl = document.createElement('div');
  msgEl.style.fontSize = '14px';
  msgEl.style.opacity = '0.9';
  msgEl.textContent = message;

  toast.appendChild(titleEl);
  toast.appendChild(msgEl);
  document.body.appendChild(toast);

  // Trigger reflow
  void toast.offsetWidth;

  // Animate in
  toast.style.transform = 'translateY(0) scale(1)';
  toast.style.opacity = '1';

  // Remove after 5 seconds
  setTimeout(() => {
    toast.style.transform = 'translateY(20px) scale(0.95)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 5000);
}

console.log('🚀 [AI Studio Archiver] Content script initialized with Network Observer.');
