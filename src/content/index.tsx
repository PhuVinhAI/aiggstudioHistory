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
});

// Auto-Watch Kilo Logic
let isGenerating = false;
let autoWatchEnabled = false;

// Khởi tạo trạng thái ban đầu
chrome.storage.local.get(['autoWatchKilo'], (res) => {
  autoWatchEnabled = !!res.autoWatchKilo;
});

// Lắng nghe nếu người dùng bật/tắt trong Popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoWatchKilo) {
    autoWatchEnabled = !!changes.autoWatchKilo.newValue;
  }
});

const observer = new MutationObserver(() => {
  if (!autoWatchEnabled) return;

  const runButton = document.querySelector('ms-run-button button');
  if (!runButton) return;

  const html = runButton.innerHTML;
  
  // Logic kiểm tra mới: Chỉ cần tìm xem có chữ Stop hoặc icon progress_activity (đang xoay) không
  const isRunning = html.includes('progress_activity') || html.includes('Stop');

  // Chỉ in log và xử lý khi có sự THAY ĐỔI trạng thái (từ Idle -> Run hoặc Run -> Idle)
  if (isRunning && !isGenerating) {
    isGenerating = true;
    console.log('🔄 [Auto-watch Debug] Trạng thái: ĐANG CHẠY (AI is generating...)');
  } 
  else if (!isRunning && isGenerating) {
    isGenerating = false;
    console.log('✅ [Auto-watch Debug] Trạng thái: HOÀN THÀNH. Gọi Kilo sau 3 giây...');
    
    // Đợi 3 giây để đảm bảo Google Drive đã kịp lưu lượt chat mới nhất
    setTimeout(() => {
      console.log('🚀 [Auto-watch Debug] Bắn tín hiệu executeKiloWorkflow tới Background!');
      chrome.runtime.sendMessage({ 
        action: 'executeKiloWorkflow', 
        url: window.location.href 
      });
    }, 3000);
  }
});

// Theo dõi toàn bộ DOM để bắt được nút Run
observer.observe(document.body, { childList: true, subtree: true });
