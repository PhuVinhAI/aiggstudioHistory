import { useState, useEffect } from 'react';
import { FileText, Image, FileType, Trash2 } from 'lucide-react';
import type { Vault } from '../types';

export default function Popup() {
  const [vault, setVault] = useState<Vault>({});
  const [includeImages, setIncludeImages] = useState(true);
  const [includePDFs, setIncludePDFs] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const result = await chrome.storage.local.get(['vault', 'includeImages', 'includePDFs']);
    setVault((result.vault as Vault) || {});
    setIncludeImages(result.includeImages !== false);
    setIncludePDFs(result.includePDFs !== false);
  };

  const handleToggleImages = async (checked: boolean) => {
    setIncludeImages(checked);
    await chrome.storage.local.set({ includeImages: checked });
  };

  const handleTogglePDFs = async (checked: boolean) => {
    setIncludePDFs(checked);
    await chrome.storage.local.set({ includePDFs: checked });
  };

  const handleClearVault = async () => {
    if (confirm('Xóa tất cả file đã lưu?')) {
      await chrome.storage.local.set({ vault: {} });
      setVault({});
    }
  };

  const fileCount = Object.keys(vault).length;
  const imageCount = Object.values(vault).filter(f => f.mimeType.startsWith('image/')).length;
  const pdfCount = Object.values(vault).filter(f => f.mimeType === 'application/pdf').length;
  const textCount = Object.values(vault).filter(f => f.mimeType.startsWith('text/')).length;

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>AI Studio Chat Archiver</h1>
        <p className="status">
          {fileCount > 0 ? `${fileCount} file đã lưu` : 'Sẵn sàng'}
        </p>
      </header>

      <div className="popup-content">
        <section className="file-stats">
          <div className="stat-item">
            <Image size={16} />
            <span>{imageCount} ảnh</span>
          </div>
          <div className="stat-item">
            <FileType size={16} />
            <span>{pdfCount} PDF</span>
          </div>
          <div className="stat-item">
            <FileText size={16} />
            <span>{textCount} text</span>
          </div>
        </section>

        <section className="settings">
          <h2>Cấu hình Export</h2>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => handleToggleImages(e.target.checked)}
            />
            <span>Bao gồm ảnh</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includePDFs}
              onChange={(e) => handleTogglePDFs(e.target.checked)}
            />
            <span>Bao gồm PDF</span>
          </label>
        </section>

        {fileCount > 0 && (
          <section className="file-list">
            <div className="file-list-header">
              <h2>File đã lưu</h2>
              <button onClick={handleClearVault} className="clear-btn" title="Xóa tất cả">
                <Trash2 size={16} />
              </button>
            </div>
            <ul>
              {Object.entries(vault).map(([filename, data]) => (
                <li key={filename} className="file-item">
                  <span className="file-icon">
                    {data.mimeType.startsWith('image/') ? <Image size={14} /> :
                     data.mimeType === 'application/pdf' ? <FileType size={14} /> :
                     <FileText size={14} />}
                  </span>
                  <span className="file-name" title={filename}>{filename}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="popup-footer">
        <p>Mở AI Studio và nhấn Export để tải xuống</p>
      </footer>
    </div>
  );
}
