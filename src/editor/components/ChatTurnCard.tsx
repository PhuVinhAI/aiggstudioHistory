import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, Image as ImageIcon, Brain, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '@/lib/store';
import type { ChatTurn } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

interface ChatTurnCardProps {
  turn: ChatTurn;
  index: number;
}

export function ChatTurnCard({ turn, index }: ChatTurnCardProps) {
  const { selectedTurns, toggleTurnSelection, removeTurn, removeAttachment, exportThinkingMap, setExportThinking } = useEditorStore();
  const isSelected = selectedTurns.has(index);
  const [showContent, setShowContent] = useState(true);
  const [showThinkingSection, setShowThinkingSection] = useState(false);
  
  const exportThinking = exportThinkingMap.get(index) ?? true;

  const hasContent = !!turn.content;
  const hasThoughts = !!turn.thoughts;
  const isModel = turn.role === 'model';

  return (
    <div className={`group border-l-2 py-8 px-8 transition-all ${isSelected ? 'border-foreground bg-muted/30' : 'border-transparent hover:border-border'}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleTurnSelection(index)}
            className="rounded-none border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background"
          />
          <span className="text-xs font-black uppercase tracking-widest">
            {turn.role} <span className="text-muted-foreground font-normal ml-2">[{String(index + 1).padStart(2, '0')}]</span>
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
      </div>
      <div className="space-y-3">
        {/* Nếu là Model và có cả thinking + content, gộp chung */}
        {isModel && hasThoughts && hasContent ? (
          <div className="space-y-3">
            {/* Thinking Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={exportThinking}
                    onCheckedChange={(checked) => setExportThinking(index, !!checked)}
                  />
                  <Brain className="h-4 w-4" />
                  <span className="text-sm font-medium">Thinking Process</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowThinkingSection(!showThinkingSection)}
                  className="h-6 w-6"
                >
                  {showThinkingSection ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>
              {showThinkingSection && (
                <div className="prose prose-sm max-w-none dark:prose-invert pl-6 text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {turn.thoughts}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Response Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">Response</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContent(!showContent)}
                  className="h-6 w-6"
                >
                  {showContent ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>
              {showContent && (
                <div className="prose prose-sm max-w-none dark:prose-invert pl-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {turn.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Content riêng (User hoặc Model không có thinking) */}
            {hasContent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {turn.role === 'user' ? 'Message' : 'Response'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContent(!showContent)}
                    className="h-6 w-6"
                  >
                    {showContent ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
                {showContent && (
                  <div className="prose prose-sm max-w-none dark:prose-invert pl-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {turn.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
            
            {/* Thinking riêng (Model có thinking nhưng không có content) */}
            {isModel && hasThoughts && !hasContent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="text-sm font-medium">Thinking Process</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowThinkingSection(!showThinkingSection)}
                    className="h-6 w-6"
                  >
                    {showThinkingSection ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </div>
                {showThinkingSection && (
                  <div className="prose prose-sm max-w-none dark:prose-invert pl-6 text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {turn.thoughts}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </>
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
      </div>
    </div>
  );
}
