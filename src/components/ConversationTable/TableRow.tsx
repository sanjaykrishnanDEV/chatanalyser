import { TableCell, TableRow as ShadcnTableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils/conversation';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/types';
export interface ColumnDef {
  id: string;
  label: string;
  path: string;
  defaultVisible: boolean;
}
interface TableRowProps {
  conversation: Conversation;
  columns: ColumnDef[];
  expanded: boolean;
  onClick: () => void;
  onSelect: ()=>void;
}

export function TableRow({ 
  conversation, 
  columns,
  expanded, 
  onClick 
}: TableRowProps) {
  const messageCount = conversation.conversation_parts?.conversation_parts?.length || 0;
  const messages = conversation.conversation_parts?.conversation_parts?.filter(
    part => part?.body && ['note', 'comment'].includes(part.part_type)
  ) || [];

  const getCellContent = (path: string) => {
    const parts = path.split('.');
    let value: any = conversation;
    
    for (const part of parts) {
      if (!value) return 'N/A';
      if (part === 'length') {
        return value?.length ?? 0;
      }
      value = value[part];
    }

    if (path === 'created_at') {
      return formatDate(value);
    }

    if (path === 'conversation_parts.conversation_parts.length') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {messageCount}
        </Badge>
      );
    }

    if (path === 'source.subject') {
      return value?.replace(/<\/?p>/g, '') || 'No Subject';
    }

    return value || 'N/A';
  };

  return (
    <>
      <ShadcnTableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={onClick}
      >
        {columns.map((column, index) => (
          <TableCell key={column.id} className={index === 0 ? "font-medium" : ""}>
            {index === 0 ? (
              <span className="flex items-center gap-2">
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {getCellContent(column.path)}
              </span>
            ) : (
              getCellContent(column.path)
            )}
          </TableCell>
        ))}
      </ShadcnTableRow>
      
      {expanded && messages.length > 0 && (
        <ShadcnTableRow>
          <TableCell colSpan={columns.length} className="p-0">
            <div className="bg-muted/30 p-4">
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.author.type === 'admin'
                          ? 'bg-primary/10 ml-4'
                          : 'bg-background mr-4'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.author.name}</p>
                      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TableCell>
        </ShadcnTableRow>
      )}
    </>
  );
}