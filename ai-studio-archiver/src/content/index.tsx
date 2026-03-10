import { createRoot } from 'react-dom/client';
import { Download } from 'lucide-react';
import { scrapeChatHistory } from '../utils/scraper';
import { exportChat } from '../utils/export';
import type { Vault, ExportConfig } from '../types';
import './styles.css';

function injectExportButton() {
  // Wait for the page to load
  const observer = new MutationObserver(() => {
    const header = document.querySelector('header');
    if (!header) return;

    // Check if button already exists
    if (document.getElementById('ai-studio-export-btn')) return;

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'ai-studio-export-btn';
    buttonContainer.className = 'export-button-container';

    // Insert before share button or at the end
    const shareButton = header.querySelector('[aria-label*="Share"]');
    if (shareButton?.parentElement) {
      shareButton.parentElement.insertBefore(buttonContainer, shareButton);
    } else {
      header.appendChild(buttonContainer);
    }

    // Render React button
    const root = createRoot(buttonContainer);
    root.render(<ExportButton />);

    observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function ExportButton() {
  const handleExport = async () => {
    try {
      // Get vault from storage
      const result = await chrome.storage.local.get('vault');
      const vault: Vault = (result.vault as Vault) || {};

      // Get export config from storage
      const configResult = await chrome.storage.local.get(['includeImages', 'includePDFs']);
      const config: ExportConfig = {
        includeImages: configResult.includeImages !== false,
        includePDFs: configResult.includePDFs !== false
      };

      // Scrape chat history
      const chatTurns = scrapeChatHistory();

      if (chatTurns.length === 0) {
        alert('Không tìm thấy lịch sử chat để xuất');
        return;
      }

      // Export
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
      title="Export Chat History"
    >
      <Download size={20} />
      <span>Export</span>
    </button>
  );
}

// Initialize
injectExportButton();
