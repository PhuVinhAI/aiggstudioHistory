import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

export default function Popup() {
  const [includeImages, setIncludeImages] = useState(true);
  const [includePDFs, setIncludePDFs] = useState(true);
  const [driveToken, setDriveToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const result = await chrome.storage.local.get(['includeImages', 'includePDFs', 'driveToken']);
    setIncludeImages(result.includeImages !== false);
    setIncludePDFs(result.includePDFs !== false);
    setDriveToken((result.driveToken as string) || '');
  };

  const handleToggleImages = async (checked: boolean) => {
    setIncludeImages(checked);
    await chrome.storage.local.set({ includeImages: checked });
  };

  const handleTogglePDFs = async (checked: boolean) => {
    setIncludePDFs(checked);
    await chrome.storage.local.set({ includePDFs: checked });
  };

  const handleSaveToken = async () => {
    await chrome.storage.local.set({ driveToken });
    setShowTokenInput(false);
    alert('Drive token đã được lưu');
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>AI Studio Chat Archiver</h1>
        <p className="status">Sẵn sàng export</p>
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

          <h2>Cấu hình Export</h2>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => handleToggleImages(e.target.checked)}
            />
            <span>Tải ảnh từ Drive</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includePDFs}
              onChange={(e) => handleTogglePDFs(e.target.checked)}
            />
            <span>Tải PDF từ Drive</span>
          </label>
        </section>
      </div>

      <footer className="popup-footer">
        <p>Mở AI Studio và nhấn Export để tải xuống</p>
      </footer>
    </div>
  );
}
