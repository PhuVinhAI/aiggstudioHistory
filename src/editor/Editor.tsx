import { useLoadChatData } from '@/hooks/useLoadChatData';
import { useEditorStore } from '@/lib/store';
import { Toolbar } from './components/Toolbar';
import { ChatTurnCard } from './components/ChatTurnCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenGuide } from '@/components/TokenGuide';
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
    const is401Error = error.includes('401') || error.includes('unauthorized');
    const isTokenMissing = error.includes('token is required');
    
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>
                  {is401Error || isTokenMissing ? 'Cần xác thực Google Drive' : 'Lỗi tải dữ liệu'}
                </CardTitle>
              </div>
              <CardDescription>
                {is401Error || isTokenMissing 
                  ? 'Token truy cập Google Drive chưa có hoặc đã hết hạn'
                  : error
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  chrome.runtime.openOptionsPage?.() || 
                  window.open(chrome.runtime.getURL('popup/index.html'), '_blank');
                }}
                className="w-full"
              >
                Mở popup để nhập token
              </Button>
            </CardContent>
          </Card>

          {(is401Error || isTokenMissing) && <TokenGuide />}
          
          {!is401Error && !isTokenMissing && (
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Thử lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background font-sans selection:bg-foreground selection:text-background">
      <Toolbar />
      
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-[1000px] py-20 px-6">
          <header className="mb-20 border-b border-foreground pb-8 flex items-end justify-between">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">Manuscript</h1>
              <p className="text-xs font-bold uppercase text-muted-foreground mt-4 tracking-widest">
                Data verification & logic refinement interface
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Session</div>
              <div className="text-sm font-bold uppercase tracking-tighter">Local_Cache_0x1</div>
            </div>
          </header>

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
