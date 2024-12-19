import { useState, useMemo } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from './DateRangePicker';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { LoadingSkeleton } from './LoadingSkeleton';
import { AVAILABLE_COLUMNS } from '@/lib/constants/columns';
import type { Conversation } from '@/types';

interface ConversationTableProps {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationTable({ conversations, loading }: ConversationTableProps) {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [limit, setLimit] = useState(100);

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Apply search filter across all fields
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(conv => {
        const searchableFields = [
          conv.source?.subject,
          conv.source?.body,
          conv.source?.author?.name,
          conv.source?.author?.email,
          ...(conv.conversation_parts?.conversation_parts?.map(part => [
            part.body,
            part.author?.name,
            part.author?.email,
          ]).flat() || []),
        ];
        return searchableFields.some(
          field => field && String(field).toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(conv => {
        const timestamp = conv.created_at * 1000;
        if (dateRange.from && timestamp < dateRange.from.getTime()) return false;
        if (dateRange.to && timestamp > dateRange.to.getTime()) return false;
        return true;
      });
    }

    // Apply limit
    return filtered.slice(0, limit);
  }, [conversations, search, dateRange, limit]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search in all fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Limit:</span>
          <Input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-24"
            min={1}
            max={10000}
          />
        </div>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader columns={AVAILABLE_COLUMNS} />
          <TableBody>
            {filteredConversations.map((conversation) => (
              <TableRow
                key={conversation.id}
                conversation={conversation}
                onSelect={() => ('')} columns={[]} expanded={false} onClick={function (): void {
                  throw new Error('Function not implemented.');
                } }              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredConversations.length} of {conversations.length} conversations
          {search && ` (filtered by search: "${search}")`}
          {(dateRange.from || dateRange.to) && ' (filtered by date)'}
        </p>
      </div>
    </div>
  );
}