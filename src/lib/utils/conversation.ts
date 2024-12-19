import type { Conversation, ConversationPart } from '@/types';

export function filterConversations(conversations: Conversation[], search: string): Conversation[] {
  if (!search.trim()) return conversations;
  
  const searchLower = search.toLowerCase();
  return conversations.filter(conv => {
    const subject = conv.source?.subject?.toLowerCase() ?? '';
    const body = conv.source?.body?.toLowerCase() ?? '';
    const messages = filterConversationParts(conv);
    const messageContent = messages
      .map(msg => msg.body?.toLowerCase() ?? '')
      .join(' ');
    
    return (
      subject.includes(searchLower) || 
      body.includes(searchLower) || 
      messageContent.includes(searchLower)
    );
  });
}

export function formatSubject(subject: string | null | undefined): string {
  if (!subject) return 'No Subject';
  return subject.replace(/<\/?p>/g, '').trim();
}

export function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp * 1000).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function filterConversationParts(conversation: Conversation): ConversationPart[] {
  if (!conversation?.conversation_parts?.conversation_parts) {
    return [];
  }
  
  return conversation.conversation_parts.conversation_parts
    .filter(part => 
      part?.body && 
      part.part_type && 
      ['note', 'comment'].includes(part.part_type)
    );
}

export function summarizeMessages(messages: ConversationPart[]): string {
  if (messages.length === 0) return 'No messages';
  
  const preview = messages[0].body;
  if (!preview) return 'No content';
  
  const cleaned = preview.replace(/<[^>]*>/g, '').trim();
  return cleaned.length > 50 ? `${cleaned.slice(0, 50)}...` : cleaned;
}