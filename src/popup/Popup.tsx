import { useState, useEffect } from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { extractPromptIdFromUrl } from '../utils/api';

export default function Popup() {
  const [driveToken, setDriveToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    loadData();
    getCurrentTabUrl();
  }, []);

  const loadData = async () => {
    const result = await chrome.storage.local.get(['driveToken']);
    setDriveToken((result.driveToken as string) || '');
  };

  const getCurrentTabUrl = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    setCurrentUrl(tab.url || '');
  };

  const handleSaveToken = async () => {
    await chrome.storage.local.set({ driveToken });
    setShowTokenInput(false);
    alert('Drive token đã được lưu');
  };

  const handleOpenEditor = async () => {
    const promptId = extractPromptIdFromUrl(currentUrl);
    if (!promptId) {
      alert('Vui lòng mở trang AI Studio chat trước');
      return;
    }

    // Mở editor trong tab mới
    const editorUrl = chrome.runtime.getURL(`src/editor/index.html?promptId=${promptId}`);
    await chrome.tabs.create({ url: editorUrl });
  };

  const isAIStudioPage = currentUrl.includes('aistudio.google.com');

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>AI Studio Chat Archiver</h1>
        <p className="status">
          {isAIStudioPage ? 'Sẵn sàng' : 'Vui lòng mở AI Studio'}
        </p>
      </header>

      <div className="popup-content">
        <section className="settings">
          <h2>Drive API Token</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <button 
              onClick={() => setShowTokenInput(!showTokenInput)} 
              className="toggle-token-btn"
              title={driveToken ? 'Token đã lưu' : 'Chưa có token'}
              style={{
                padding: '6px 12px',
                background: driveToken ? '#34a853' : '#5f6368',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <Key size={14} />
              <span>{driveToken ? 'Đã có token' : 'Nhập token'}</span>
            </button>
          </div>
          
          {showTokenInput && (
            <div style={{ marginBottom: '12px' }}>
              <input
                type="password"
                value={driveToken}
                onChange={(e) => setDriveToken(e.target.value)}
                placeholder="Nhập Drive API token..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  fontSize: '13px',
                  marginBottom: '8px'
                }}
              />
              <button 
                onClick={handleSaveToken}
                style={{
                  padding: '6px 16px',
                  background: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Lưu
              </button>
            </div>
          )}
          
          <p style={{ fontSize: '12px', color: '#5f6368', marginBottom: '16px' }}>
            Token cần thiết để tải file từ Drive (nếu file không public)
          </p>
        </section>

        <button
          onClick={handleOpenEditor}
          disabled={!isAIStudioPage}
          style={{
            width: '100%',
            padding: '12px',
            background: !isAIStudioPage ? '#dadce0' : '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: !isAIStudioPage ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <ExternalLink size={20} />
          <span>Mở Editor</span>
        </button>
      </div>

      <footer className="popup-footer">
        <p>Mở AI Studio chat và nhấn "Mở Editor"</p>
      </footer>
    </div>
  );
}
