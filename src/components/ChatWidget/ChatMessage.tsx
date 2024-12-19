import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { ConversationPart } from '@/types';

interface ChatMessageProps {
  message: ConversationPart;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isAdmin = message.author.type === 'admin';
  
  return (
    <div
      className={cn(
        'p-4 rounded-lg transition-colors',
        isAdmin ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{message.author.name}</span>
        <span className="text-xs text-muted-foreground">
          {message.author.type}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
    </div>
  );
});