import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatSubject, formatDate } from '@/lib/utils/conversation';
import type { Conversation } from '@/types';
import { toast } from 'sonner';

interface ConversationTableProps {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
  setChatData: (data: string[]) => void;
  search: string;
  setSearch: (value: string) => void;
  dateRange: { from: string; to: string };
  setDateRange: (value: { from: string; to: string }) => void;
  chatHistory: string[]; 
  setChatHistory: (history: string[]) => void;
}

export function ConversationTable({
  conversations,
  loading,
  setChatData,
  search,
  setSearch,
  dateRange,
  setDateRange,
}: ConversationTableProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [displayCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setIsChatOpen] = useState(false);
  const [, setChatMessages] = useState<{ author: string; message: string }[]>([]);
  const [question, ] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [context, setContext] = useState<any[]>([]); 
  useEffect(() => {
    setDebouncedSearch(search);
  }, [search]);
  
  const debounceSearch = useCallback((value: string) => {
    const handler = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300); // 300ms delay

    return () => clearTimeout(handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debounceSearch(value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'from' | 'to') => {
   //@ts-ignore
    setDateRange((prev) => ({ ...prev, [type]: e.target.value }));
  };

  const handleResetFilters = () => {
    setLoadingState(true);
    setSearch('');
    setDebouncedSearch('');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
    setLoadingState(false);
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Convert all searchable content to lowercase for case-insensitive search
      const searchableContent = [
        // Main conversation data
        conv.source?.subject?.toLowerCase() || '',
        conv.source?.body?.toLowerCase() || '',
        conv.source?.author?.name?.toLowerCase() || '',
        conv.source?.author?.email?.toLowerCase() || '',
        
        // Conversation parts
        ...(conv.conversation_parts?.conversation_parts?.flatMap(part => [
          part.body?.toLowerCase() || '',
          part.author?.name?.toLowerCase() || '',
          part.author?.email?.toLowerCase() || '',
          // Add any other part fields you want to search
        ]) || []),
        // Add any other fields you want to search
      ].filter(Boolean); // Remove empty strings
  
      const createdAt = new Date(conv.created_at * 1000);
  
      // Filter by search
      const searchTerms = debouncedSearch.toLowerCase().split(',').map(term => term.trim());
      const matchesSearch = searchTerms.every(term =>
        searchableContent.some(content => content.includes(term))
      );
  
      // Filter by date range
      const fromDate = dateRange.from ? new Date(dateRange.from) : undefined;
      const toDate = dateRange.to ? new Date(dateRange.to) : undefined;
      const matchesDateRange =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate);
  
      return matchesSearch && matchesDateRange;
    });
  }, [conversations, debouncedSearch, dateRange]);

  useEffect(() => {
    const newContext = [];
    let tokenCount = 0;

    for (const conv of filteredConversations) {
      // Clean the conversation body by removing unwanted content
      const cleanSubject = filterUnwantedContent(conv.source?.subject || '');
      const cleanConversationParts = conv.conversation_parts.conversation_parts.map((part) => ({
        body: filterUnwantedContent(part.body || ''),
        authorName: part.author?.name ?? 'Unknown',
      }));

      const conversationText = `${cleanSubject} ${cleanConversationParts.map((part) => part.body).join(' ')}`;
      const conversationTokens = estimateTokenCount(conversationText);

      // Break if adding this conversation exceeds the token limit
      if (tokenCount + conversationTokens > 10000 * 0.9) break;

      newContext.push({
        subject: cleanSubject,
        createdAt: conv.created_at,
        author: conv.source?.author?.name ?? 'Unknown',
        conversationParts: cleanConversationParts,
      });

      tokenCount += conversationTokens;
    }

    setContext(newContext);
  }, [filteredConversations])
  
  const totalPages = Math.ceil(filteredConversations.length / displayCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * displayCount,
    currentPage * displayCount
  );

  // Token estimation function
const estimateTokenCount = (text: string) => {
  return Math.ceil(text.split(/\s+/).length / 3); // Approx. 1 token per 0.75 words
};

// Cleaning function to filter unwanted content
const filterUnwantedContent = (text: string) => {
  if (!text) return '';
  // Remove URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Remove image references
  const imageRegex = /\[Image\s".*?"\]/g;
  // Remove special characters (like &amp;)
  const specialCharRegex = /&\w+;/g;
  // Remove extra spaces
  const extraSpaceRegex = /\s+/g;

  return text
    .replace(urlRegex, '')
    .replace(imageRegex, '')
    .replace(specialCharRegex, '')
    .replace(extraSpaceRegex, ' ')
    .trim();
};
const handleAddToChat = async () => {
  setLoadingState(true);
  setChatData([]);
  setChatMessages([]);

  try {
    const requestData = {
      data: context, // Use existing context instead of creating new one
      headers: ['subject', 'createdAt', 'author', 'conversationParts'],
      question: question || defaultQuestion,
      promptType: "extractInfo",
    };

    setChatMessages((prev) => [
      ...prev,
      { author: 'User', message: 'Adding to chat...' },
    ]);

    await handleSubmitToOpenAI(requestData);
    setIsChatOpen(true);
    console.log("data", JSON.stringify(requestData));
  } catch (error) {
    console.error('Error in handleAddToChat:', error);
    toast.error("Error while adding to chat.");
  } finally {
    setLoadingState(false);
  }
};
  
  const defaultQuestion = `
You're an expert CSM analysing intercom pasts chats

Conversation data is provided in the following format:
- Each entry in the data array includes:
  - **subject**: A string representing the topic of the conversation.
  - **createdAt**: The date and time of creation in ISO format.
  - **author**: The person who initiated the conversation.
  - **conversationParts**: An array of strings, each representing a segment of the conversation authored by participants.

Please analyze this data and provide the following:

1. **Key Point Summary**:
   - What are the 3-5 most common topics/issues across all conversations?
   - Identify any notable patterns in customer inquiries or concerns

2. **Theme Analysis**:
   - Identify recurring topics or themes across all conversations.
   - Categorize them into major groups (e.g., technical, operational, interpersonal).

3. **Communication Suggestions**:
   - Assess the clarity and effectiveness of the communication.
   - Suggest improvements to address any identified issues (e.g., miscommunication, lack of detail).

4. **Sentiment Analysis**:
   - Determine the tone (positive, negative, neutral) for each conversation or segment.
   - Provide examples to support your sentiment assessment.

5. **Impact of Tone on Effectiveness**:
   - Discuss how the tone of conversations influences their outcomes.
   - Offer strategies to maintain a constructive and professional tone in future discussions.

**Output Format**:
- Use structured sections with clear headings for each analysis point.
- Include bullet points or concise explanations for ease of understanding.
- make sure to fit the response to a maximum of 500 tokens limit
conversation data follows
---
`;

const handleSubmitToOpenAI = async (requestData: any, retries: number = 3) => {
  try {
      const response = await fetch('http://localhost:5000/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.status === 429 && retries > 0) {
      toast.error("Too many requests. Please try again later."); // Notify user of 429 error
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return handleSubmitToOpenAI(requestData, retries - 1); // Retry
    }

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    setChatMessages((prev) => [...prev, { author: 'AI', message: result.message }]);
    setChatData([result.message]);
  } catch (error) {
    console.error("Error submitting to OpenAI:", error);
  }
};

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4  overflow-hidden ">
      {/* Search and Date Range Inputs */}
      <div className="flex ">
        <div className="flex flex-col w-1/3 pr-2 mr-5 ml-1">
          <div className="text-lg">Search Term</div>
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="mr-4">
            <label className='text-lg'>From:</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange(e, 'from')}
            />
          </div>
          <div>
            <label className='text-lg'>To:</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange(e, 'to')}
            />
          </div>
        </div>
      </div>

      {/* Selected count and buttons */}
      <div className="flex items-center w-full space-x-4 mt-4 justify-between">
        {/* Selected {context.length} of {filteredConversations.length} chats ({conversations.length} total chats) */}
        <p>Selected top {context.length} out of total {filteredConversations.length} chats to fit context length</p>
        <div className="flex items-center ml-auto">
          <button disabled={loadingState} onClick={handleResetFilters} className="btn bg-secondary text-black  mr-2">
            Reset Filters
          </button>
          <button
  disabled={loadingState}
  onClick={handleAddToChat}
  className={`btn ${loadingState ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white'}`}
>
  {loadingState ? 'Processing...' : 'Add to Chat'}
</button>
        </div>
      </div>

      {/* Conversations Table */}
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Author Email</TableHead>
              <TableHead>Body</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedConversations.map((conversation) => (
              <TableRow key={conversation.id} className="hover:bg-muted/50">
                <TableCell className="font-medium w-1/4">
                  {formatSubject(conversation.source?.subject)}
                </TableCell>
                <TableCell className="w-1/4">
                  {formatDate(conversation.created_at)}
                </TableCell>
                <TableCell className="w-1/4">{conversation.source?.author?.name ?? 'Unknown'}</TableCell>
                <TableCell className="w-1/4">{conversation.source?.author?.email ?? 'Unknown'}</TableCell>
                <TableCell className="w-1/4">{conversation.source?.body}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="btn bg-secondary text-black">
          Previous
        </button>
          {/* <span>Page {currentPage} of {totalPages}</span> */}
        <div className="flex items-center space-x-4">
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="btn bg-secondary text-black"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
