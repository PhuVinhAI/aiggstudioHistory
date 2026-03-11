import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, CheckSquare, Square } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import { exportChat } from '@/utils/export';
import { toast } from 'sonner';
import type { ChatTurn } from '@/types';

export function Toolbar() {
  const {
    chatTurns,
    selectedTurns,
    showThinking,
    includeImages,
    includePDFs,
    driveToken,
    selectAllTurns,
    deselectAllTurns,
    setShowThinking,
    setIncludeImages,
    setIncludePDFs,
  } = useEditorStore();

  const handleExport = async () => {
    try {
      // Lọc chỉ những turns được chọn
      const turnsToExport = chatTurns.filter((_: ChatTurn, index: number) => selectedTurns.has(index));
      
      if (turnsToExport.length === 0) {
        toast.error('Vui lòng chọn ít nhất một turn để export');
        return;
      }

      // Nếu không show thinking, xóa thoughts khỏi turns
      const processedTurns = showThinking 
        ? turnsToExport 
        : turnsToExport.map((turn: ChatTurn) => ({ ...turn, thoughts: undefined }));

      await exportChat(
        processedTurns,
        { includeImages, includePDFs },
        driveToken || undefined
      );
      
      toast.success('Export thành công!');
    } catch (error) {
      toast.error('Export thất bại: ' + (error as Error).message);
    }
  };

  const allSelected = selectedTurns.size === chatTurns.length;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? deselectAllTurns : selectAllTurns}
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
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-thinking"
              checked={showThinking}
              onCheckedChange={setShowThinking}
            />
            <Label htmlFor="show-thinking" className="text-sm">
              Hiện thinking
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

        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export ({selectedTurns.size}/{chatTurns.length})
        </Button>
      </div>
    </div>
  );
}
