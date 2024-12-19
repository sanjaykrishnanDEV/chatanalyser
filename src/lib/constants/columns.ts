import type { ColumnDef } from '@/types';

export const AVAILABLE_COLUMNS: ColumnDef[] = [
  {
    id: 'subject',
    label: 'Subject',
    path: 'source.subject',
    defaultVisible: true,
  },
  {
    id: 'created_at',
    label: 'Created At',
    path: 'created_at',
    defaultVisible: true,
  },
  {
    id: 'author_name',
    label: 'Author Name',
    path: 'source.author.name',
    defaultVisible: true,
  },
  {
    id: 'author_email',
    label: 'Author Email',
    path: 'source.author.email',
    defaultVisible: true,
  },
  {
    id: 'message_count',
    label: 'Messages',
    path: 'conversation_parts.conversation_parts.length',
    defaultVisible: true,
  },
  {
    id: 'body',
    label: 'Content',
    path: 'source.body',
    defaultVisible: false,
  },
];