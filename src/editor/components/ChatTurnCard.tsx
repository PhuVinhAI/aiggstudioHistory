import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { ChatTurn } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatTurnCardProps {
  turn: ChatTurn;
  index: number;
}

export function ChatTurnCard({ turn, index }: ChatTurnCardProps) {
  const { selectedTurns, toggleTurnSelection, removeTurn, removeAttachment, showThinking } = useEditorStore();
  const isSelected = selectedTurns.has(index);

  return (
    <Card className={isSelected ? 'border-primary' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleTurnSelection(index)}
          />
          <span className="font-semibold">
            {turn.role === 'user' ? '👤 User' : '🤖 Model'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeTurn(index)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {turn.content && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {turn.content}
            </ReactMarkdown>
          </div>
        )}
        
        {showThinking && turn.thoughts && (
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium text-sm">
              💭 Thinking Process
            </summary>
            <div className="mt-2 text-sm text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {turn.thoughts}
              </ReactMarkdown>
            </div>
          </details>
        )}
        
        {turn.attachments && turn.attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Đính kèm:</p>
            <div className="flex flex-wrap gap-2">
              {turn.attachments.map((attachment: string, attIdx: number) => {
                const isImage = attachment.startsWith('drive_image_');
                const isDrive = attachment.startsWith('drive_');
                
                return (
                  <div
                    key={attIdx}
                    className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                  >
                    {isImage ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="truncate max-w-[200px]">
                      {isDrive ? attachment.replace('drive_doc_', '').replace('drive_image_', '').slice(0, 12) + '...' : attachment}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeAttachment(index, attIdx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
