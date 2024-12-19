// Add to existing types.ts
export interface FilterState {
  search: string;
  messageCount: string;
  dateRange: {
    from: number | null;
    to: number | null;
  };
}

export interface ConversationPart {
  type: string;
  id: string;
  part_type: string;
  body: string | null;
  created_at: number;
  author: {
    type: string;
    name: string;
    email?: string;
  };
}

export interface Conversation {
  id: string;
  created_at: number;
  updated_at: number;
  source?: {
    subject?: string;
    body?: string;
    author?: {
      name: string;
      email: string;
    };
  };
  conversation_parts: {
    conversation_parts: ConversationPart[];
  };
}