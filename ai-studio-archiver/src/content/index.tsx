import { createRoot } from 'react-dom/client';
import { Download } from 'lucide-react';
import { exportChat } from '../utils/export';
import { extractPromptIdFromUrl, fetchPromptDataFromDrive, convertPromptDataToChatTurns } from '../utils/api';
import type { Vault, ExportConfig } from '../types';

// Inject styles
const style = document.createElement('style');
style.textContent = `
  .export-button-container {
    display: inline-flex;
    margin: 0 8px;
  }

  .export-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .export-button:hover {
    background: #1557b0;
  }

  .export-button:active {
    background: #0d47a1;
  }
`;
document.head.appendChild(style);

function injectExportButton() {
  const observer = new MutationObserver(() => {
    const chatSession = document.querySelector('ms-chat-session');
    if (!chatSession) return;

    if (document.getElementById('ai-studio-export-btn')) return;

    let targetContainer = document.querySelector('header');
    
    if (!targetContainer) {
      targetContainer = document.querySelector('[role="toolbar"]');
    }
    
    if (!targetContainer) {
      createFloatingButton();
      observer.disconnect();
      return;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'ai-studio-export-btn';
    buttonContainer.className = 'export-button-container';

    targetContainer.appendChild(buttonContainer);

    const root = createRoot(buttonContainer);
    root.render(<ExportButton />);

    observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function createFloatingButton() {
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'ai-studio-export-btn';
  buttonContainer.className = 'export-button-container';
  buttonContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
  `;
  
  document.body.appendChild(buttonContainer);
  
  const root = createRoot(buttonContainer);
  root.render(<ExportButton />);
}

function ExportButton() {
  const handleExport = async () => {
    try {
      const promptId = extractPromptIdFromUrl(window.location.href);
      if (!promptId) {
        alert('Không tìm thấy ID prompt trong URL');
        return;
      }

      const promptData = await fetchPromptDataFromDrive(promptId);
      if (!promptData) {
        alert('Không thể tải dữ liệu từ Drive');
        return;
      }

      // Get vault and config
      const result = await chrome.storage.local.get('vault');
      const vault: Vault = (result.vault as Vault) || {};

      const configResult = await chrome.storage.local.get(['includeImages', 'includePDFs']);
      const config: ExportConfig = {
        includeImages: configResult.includeImages !== false,
        includePDFs: configResult.includePDFs !== false
      };

      // Convert to chat turns for markdown export
      const chatTurns = convertPromptDataToChatTurns(promptData);
      
      if (chatTurns.length === 0) {
        alert('Không tìm thấy lịch sử chat');
        return;
      }

      // Export markdown only
      await exportChat(chatTurns, vault, config);
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Xuất thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="export-button"
      title="Export Chat"
    >
      <Download size={20} />
      <span>Export</span>
    </button>
  );
}

injectExportButton();
