import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, CheckSquare, Square, RotateCcw, Loader2 } from 'lucide-react';
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

        <Button onClick={handleExport} disabled={isExporting}>
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
  );
}
