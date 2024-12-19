import type { Conversation } from '@/types';

export function deepSearch(obj: any, searchTerm: string): boolean {
  if (!searchTerm) return true;
  const term = searchTerm.toLowerCase();

  // Handle null/undefined
  if (!obj) return false;

  // Handle primitive types
  if (typeof obj !== 'object') {
    return String(obj).toLowerCase().includes(term);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.some(item => deepSearch(item, term));
  }

  // Handle objects
  return Object.values(obj).some(value => deepSearch(value, term));
}