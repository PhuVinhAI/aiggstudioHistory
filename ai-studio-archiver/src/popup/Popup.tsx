import { useState, useEffect } from 'react';
import { Key, Download, Loader2 } from 'lucide-react';
import { exportChat } from '../utils/export';
import { extractPromptIdFromUrl, fetchPromptDataFromDrive, convertPromptDataToChatTurns } from '../utils/api';
import type { ExportConfig } from '../types';

export default function Popup() {
  const [includeImages, setIncludeImages] = useState(true);
  const [includePDFs, setIncludePDFs] = useState(true);
  const [driveToken, setDriveToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    loadData();
    getCurrentTabUrl();
  }, []);

  const loadData = async () => {
    const result = await chrome.storage.local.get(['includeImages', 'includePDFs', 'driveToken']);
    setIncludeImages(result.includeImages !== false);
    setIncludePDFs(result.includePDFs !== false);
    setDriveToken((result.driveToken as string) || '');
  };

  const getCurrentTabUrl = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    setCurrentUrl(tab.url || '');
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

  const handleExport = async () => {
    setIsExporting(true);
    setProgress('Đang kiểm tra URL...');

    try {
      const promptId = extractPromptIdFromUrl(currentUrl);
      if (!promptId) {
        alert('Vui lòng mở trang AI Studio chat trước khi export');
        return;
      }

      setProgress('Đang tải dữ liệu từ Drive...');
      const promptData = await fetchPromptDataFromDrive(promptId, driveToken || undefined);
      
      if (!promptData) {
        const needToken = !driveToken;
        if (needToken) {
          alert('Không thể tải dữ liệu từ Drive.\n\nFile có thể cần token. Vui lòng nhập Drive API token và thử lại.');
        } else {
          alert('Không thể tải dữ liệu từ Drive.\n\nToken có thể đã hết hạn hoặc không có quyền truy cập.');
        }
        return;
      }

      setProgress('Đang xử lý dữ liệu chat...');
      const config: ExportConfig = {
        includeImages,
        includePDFs
      };

      const chatTurns = convertPromptDataToChatTurns(promptData);
      
      if (chatTurns.length === 0) {
        alert('Không tìm thấy lịch sử chat');
        return;
      }

      setProgress('Đang tải file đính kèm...');
      await exportChat(chatTurns, config, driveToken || undefined);
      
      setProgress('Hoàn tất!');
      setTimeout(() => setProgress(''), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Xuất thất bại: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const isAIStudioPage = currentUrl.includes('aistudio.google.com');

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>AI Studio Chat Archiver</h1>
        <p className="status">
          {isAIStudioPage ? 'Sẵn sàng export' : 'Vui lòng mở AI Studio'}
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

          <h2>Cấu hình Export</h2>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => handleToggleImages(e.target.checked)}
              disabled={isExporting}
            />
            <span>Tải ảnh từ Drive</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includePDFs}
              onChange={(e) => handleTogglePDFs(e.target.checked)}
              disabled={isExporting}
            />
            <span>Tải PDF từ Drive</span>
          </label>
        </section>

        <button
          onClick={handleExport}
          disabled={isExporting || !isAIStudioPage}
          style={{
            width: '100%',
            padding: '12px',
            background: isExporting || !isAIStudioPage ? '#dadce0' : '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isExporting || !isAIStudioPage ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px'
          }}
        >
          {isExporting ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Đang xuất...</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Export Chat</span>
            </>
          )}
        </button>

        {progress && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: '#e8f0fe',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#1967d2',
            textAlign: 'center'
          }}>
            {progress}
          </div>
        )}
      </div>

      <footer className="popup-footer">
        <p>Mở AI Studio chat và nhấn Export để tải xuống</p>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
