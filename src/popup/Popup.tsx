import { useState, useEffect } from 'react';
import { Key, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { extractPromptIdFromUrl } from '../utils/api';
import { TokenGuide } from '../components/TokenGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Popup() {
  const [driveToken, setDriveToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleOpenEditor = async () => {
    const promptId = extractPromptIdFromUrl(currentUrl);
    if (!promptId) {
      alert('Vui lòng mở trang AI Studio chat trước');
      return;
    }

    const editorUrl = chrome.runtime.getURL(`src/editor/index.html?promptId=${promptId}`);
    await chrome.tabs.create({ url: editorUrl });
  };

  const isAIStudioPage = currentUrl.includes('aistudio.google.com');

  return (
    <div className="w-[400px] max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4">
        <h1 className="text-lg font-semibold mb-1">AI Studio Chat Archiver</h1>
        <div className="flex items-center gap-2 text-sm">
          {isAIStudioPage ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Sẵn sàng</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>Vui lòng mở AI Studio</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Token Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Drive API Token</span>
              <Button
                variant={driveToken ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="h-8"
              >
                <Key className="h-3 w-3 mr-2" />
                {driveToken ? 'Đã có token' : 'Nhập token'}
              </Button>
            </CardTitle>
            <CardDescription className="text-xs">
              Token cần thiết để tải file từ Drive
            </CardDescription>
          </CardHeader>

          {showTokenInput && (
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={driveToken}
                  onChange={(e) => setDriveToken(e.target.value)}
                  placeholder="Nhập Drive API token..."
                />
              </div>
              
              <Button 
                onClick={handleSaveToken}
                className="w-full"
                size="sm"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Đã lưu!
                  </>
                ) : (
                  'Lưu token'
                )}
              </Button>

              <TokenGuide />
            </CardContent>
          )}
        </Card>

        {/* Open Editor Button */}
        <Button
          onClick={handleOpenEditor}
          disabled={!isAIStudioPage}
          className="w-full"
          size="lg"
        >
          <ExternalLink className="h-5 w-5 mr-2" />
          Mở Editor
        </Button>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/50 p-3 text-center">
        <p className="text-xs text-muted-foreground">
          Mở AI Studio chat và nhấn "Mở Editor"
        </p>
      </div>
    </div>
  );
}
