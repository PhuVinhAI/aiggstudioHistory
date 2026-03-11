import { useLoadChatData } from '@/hooks/useLoadChatData';
import { useEditorStore } from '@/lib/store';
import { Toolbar } from './components/Toolbar';
import { ChatTurnCard } from './components/ChatTurnCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import type { ChatTurn } from '@/types';

export default function Editor() {
  const { isLoading, error } = useLoadChatData();
  const { chatTurns } = useEditorStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Đang tải dữ liệu chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Lỗi</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Toolbar />
      
      <ScrollArea className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Studio Chat Editor</h1>
            <p className="text-sm text-muted-foreground">
              Chỉnh sửa và tùy chỉnh lịch sử chat trước khi export
            </p>
          </div>

          {chatTurns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không có dữ liệu chat</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatTurns.map((turn: ChatTurn, index: number) => (
                <ChatTurnCard key={index} turn={turn} index={index} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
