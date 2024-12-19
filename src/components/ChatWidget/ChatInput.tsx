import { memo } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export const ChatInput = memo(function ChatInput({ 
  value, 
  onChange, 
  onSubmit,
  disabled 
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 p-4 border-t bg-background">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask AI about this conversation..."
        className="min-h-[80px] resize-none"
        disabled={disabled}
      />
      <Button type="submit" size="icon" disabled={disabled || !value.trim()}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
});