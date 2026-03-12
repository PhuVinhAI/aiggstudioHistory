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
        console.log('✅ [Auto-watch Debug] Network Event: Đã bắt được UpdatePrompt. Dữ liệu đã lưu lên Drive.');
        
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

console.log('🚀 [AI Studio Archiver] Content script initialized with Network Observer.');
