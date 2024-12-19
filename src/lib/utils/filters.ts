import type { Conversation, FilterState } from '@/types';

export function applyFilters(
  conversations: Conversation[],
  filters: FilterState
): Conversation[] {
  return conversations.filter((conv) => {
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = [
        conv.source?.subject,
        conv.source?.body,
        conv.source?.author?.name,
        conv.source?.author?.email,
        ...(conv.conversation_parts?.conversation_parts?.map((part) => [
          part.body,
          part.author?.name,
          part.author?.email,
        ]).flat() || []),
      ];

      if (!searchableFields.some(
        (field) => field && String(field).toLowerCase().includes(searchLower)
      )) {
        return false;
      }
    }

    // Apply message count filter
    if (filters.messageCount !== 'all') {
      const messageCount = conv.conversation_parts?.conversation_parts?.length || 0;
      const [min, max] = filters.messageCount.split('-').map(Number);
      
      if (max) {
        if (messageCount < min || messageCount > max) return false;
      } else {
        if (messageCount < min) return false;
      }
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const timestamp = conv.created_at;
      if (filters.dateRange.from && timestamp < filters.dateRange.from) return false;
      if (filters.dateRange.to && timestamp > filters.dateRange.to) return false;
    }

    return true;
  });
}