import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Conversation } from '@/types';

interface FileUploaderProps {
  onUpload: (conversations: Conversation[]) => void;
  setLoading: (loading: boolean) => void;
  children: React.ReactNode;
}

export function FileUploader({ onUpload, setLoading, children }: FileUploaderProps) {
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.jsonl')) {
      toast.error('Please upload a .jsonl file');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const conversations = lines.map((line, index) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error(`Error parsing line ${index + 1}:`, error);
          throw new Error(`Invalid JSON at line ${index + 1}`);
        }
      });
      
      // Filter only required fields and validate structure
      const processedConversations = conversations.map((conv, index) => {
        if (!conv.id || !conv.created_at || !conv.conversation_parts?.conversation_parts) {
          throw new Error(`Missing required fields at line ${index + 1}`);
        }

        return {
          id: conv.id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          source: conv.source,
          conversation_parts: {
            conversation_parts: conv.conversation_parts.conversation_parts
              .filter((part: any) => 
                part?.part_type && 
                ['note', 'comment'].includes(part.part_type) &&
                part?.body
              )
          }
        };
      });

      onUpload(processedConversations);
      toast.success(`Successfully processed ${processedConversations.length} conversations`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(error instanceof Error ? error.message : 'Error processing file');
    } finally {
      setLoading(false);
      // Reset the input
      event.target.value = '';
    }
  }, [onUpload, setLoading]);

  return (
    <div className="relative">
      <input
        type="file"
        accept=".jsonl"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {children}
    </div>
  );
}