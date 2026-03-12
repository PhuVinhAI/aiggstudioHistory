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
  
  // Kiểm tra trạng thái đang chạy hay đang chờ
  const isRunning = html.includes('progress_activity') || html.includes('Stop');
  const isIdle = html.includes('keyboard_return') || html.includes('Run');

  if (isRunning && !isGenerating) {
    // Chuyển sang trạng thái đang sinh code
    isGenerating = true;
    console.log('[AI Studio Archiver] Kilo Auto-watch: AI is generating...');
  } else if (isIdle && isGenerating) {
    // Chuyển từ đang sinh sang hoàn thành
    isGenerating = false;
    console.log('[AI Studio Archiver] Kilo Auto-watch: AI finished. Triggering Kilo in 3 seconds...');
    
    // Đợi 3 giây để đảm bảo Google Drive đã kịp lưu lượt chat mới nhất
    setTimeout(() => {
      chrome.runtime.sendMessage({ 
        action: 'executeKiloWorkflow', 
        url: window.location.href 
      });
    }, 3000);
  }
});

// Theo dõi toàn bộ DOM để bắt được nút Run
observer.observe(document.body, { childList: true, subtree: true });
