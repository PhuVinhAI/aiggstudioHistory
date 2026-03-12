import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, CheckSquare, Square, RotateCcw, Loader2, Cpu } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { exportChat } from '@/utils/export';
import { toast } from 'sonner';
import { useState } from 'react';
import type { ChatTurn } from '@/types';

export function Toolbar() {
  const {
    chatTurns,
    selectedTurns,
    showThinking,
    exportThinkingMap,
    includeImages,
    includePDFs,
    driveToken,
    selectAllTurns,
    deselectAllTurns,
    restoreOriginalData,
    setShowThinking,
    setIncludeImages,
    setIncludePDFs,
  } = useEditorStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isCallingKilo, setIsCallingKilo] = useState(false);

  const handleCallKilo = async () => {
    if (chatTurns.length === 0) {
      toast.error('Không có dữ liệu chat để gửi cho Kilo');
      return;
    }

    // Lấy tin nhắn cuối cùng để làm prompt cho Kilo
    const lastTurn = chatTurns[chatTurns.length - 1];
    const prompt = lastTurn.content;

    if (!prompt) {
      toast.error('Tin nhắn cuối cùng bị rỗng');
      return;
    }

    try {
      setIsCallingKilo(true);
      const response = await fetch('http://localhost:9999/api/kilo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Không thể kết nối tới Kilo Server ở cổng 9999 (Bạn đã chạy npm run server chưa?)');
      
      toast.success('Đã gửi lệnh cho Kilo CLI làm việc! Vui lòng xem terminal chạy server.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsCallingKilo(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const turnsToExport = chatTurns.filter((_: ChatTurn, index: number) => selectedTurns.has(index));
      
      if (turnsToExport.length === 0) {
        toast.error('Vui lòng chọn ít nhất một turn để export');
        return;
      }

      // Tạo map mới với index tương ứng của turnsToExport
      const exportMap = new Map<number, boolean>();
      turnsToExport.forEach((turn: ChatTurn, newIndex: number) => {
        const originalIndex = chatTurns.indexOf(turn);
        const shouldExport = exportThinkingMap.get(originalIndex) ?? true;
        exportMap.set(newIndex, shouldExport);
      });

      await exportChat(
        turnsToExport,
        { includeImages, includePDFs },
        driveToken || undefined,
        exportMap
      );
      
      toast.success('Export thành công!');
    } catch (error) {
      toast.error('Export thất bại: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleRestore = () => {
    restoreOriginalData();
    toast.success('Đã khôi phục dữ liệu gốc!');
  };

  const allSelected = selectedTurns.size === chatTurns.length;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-4xl px-4 flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? deselectAllTurns : selectAllTurns}
            disabled={isExporting}
          >
            {allSelected ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Bỏ chọn tất cả
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Chọn tất cả
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            disabled={isExporting}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Khôi phục
          </Button>
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-thinking"
              checked={showThinking}
              onCheckedChange={setShowThinking}
            />
            <Label htmlFor="show-thinking" className="text-sm">
              Export thinking
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="include-images"
              checked={includeImages}
              onCheckedChange={setIncludeImages}
            />
            <Label htmlFor="include-images" className="text-sm">
              Tải ảnh
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="include-pdfs"
              checked={includePDFs}
              onCheckedChange={setIncludePDFs}
            />
            <Label htmlFor="include-pdfs" className="text-sm">
              Tải PDF
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="secondary"
            onClick={handleCallKilo} 
            disabled={isCallingKilo || isExporting}
            className="border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          >
            {isCallingKilo ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Cpu className="mr-2 h-4 w-4" />
            )}
            Gọi Kilo làm việc
          </Button>

          <Button onClick={handleExport} disabled={isExporting || isCallingKilo}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export ({selectedTurns.size}/{chatTurns.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
