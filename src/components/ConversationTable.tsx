import { useState, useMemo, useCallback } from 'react';
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
// import { toast } from '@/components/ui/toast'; // Toaster component
import { formatSubject, formatDate } from '@/lib/utils/conversation';
import type { Conversation } from '@/types';

interface ConversationTableProps {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
  setChatData: (data: string[]) => void;
  search: string;
  setSearch: (value: string) => void;
  dateRange: { from: string; to: string };
  setDateRange: (value: { from: string; to: string }) => void;
}

export function ConversationTable({ conversations, loading, setChatData, search, setSearch, dateRange, setDateRange }: ConversationTableProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [displayCount, ] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [, setIsChatOpen] = useState(false);
  const [, setChatMessages] = useState<{ author: string; message: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [loadingState, setLoadingState] = useState(false);

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
    // @ts-ignore
    setDateRange((prev: any) => ({ ...prev, [type]: e.target.value }));
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
      const subject = conv.source?.subject?.toLowerCase() || '';
      const body = conv.source?.body?.toLowerCase() || '';
      const createdAt = new Date(conv.created_at * 1000); // Convert Unix timestamp to Date

      // Filter by search
      const searchTerms = debouncedSearch.toLowerCase().split(',').map(term => term.trim());
      const matchesSearch = searchTerms.every(
        (term) => subject.includes(term) || body.includes(term)
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
    return Math.ceil(text.split(/\s+/).length / 0.75); // Approx. 1 token per 0.75 words
  };

  const handleAddToChat = () => {
    setLoadingState(true);
    const context = paginatedConversations.map((conv) => ({
      subject: conv.source?.subject,
      createdAt: conv.created_at,
      author: conv.source?.author?.name ?? 'Unknown',
      conversationParts: conv.conversation_parts.conversation_parts.map((part) => ({
        body: part.body,
        authorName: part.author?.name ?? 'Unknown',
      })),
    }));

    // Combine all text for token estimation
    const allText = context
      .map((conv) => `${conv.subject} ${conv.author} ${conv.conversationParts.map((part) => part.body).join(' ')}`)
      .join(' ');

    const totalTokens = estimateTokenCount(allText);
    const maxTokens = 12000;

    let trimmedContext = context;

    if (totalTokens > maxTokens) {
      let tokenCount = 0;

      // Slice the context to fit within the token limit
      trimmedContext = [];
      for (const conv of context) {
        const conversationText = `${conv.subject} ${conv.author} ${conv.conversationParts.map((part) => part.body).join(' ')}`;
        const conversationTokens = estimateTokenCount(conversationText);

        if (tokenCount + conversationTokens > maxTokens) break;
        trimmedContext.push(conv);
        tokenCount += conversationTokens;
      }

      // toast({
      //   title: 'Token Limit Exceeded',
      //   description: `The data exceeds 12,000 tokens. Sending only the top conversations within the limit.`,
      //   status: 'warning',
      // });
    }

    const defaultQuestion = `
Given the following conversation data:
- Each entry in the data array includes:
  - **subject**: A string representing the topic of the conversation.
  - **createdAt**: The date and time of creation in ISO format.
  - **author**: The person who initiated the conversation.
  - **conversationParts**: An array of strings, each representing a segment of the conversation authored by participants.

Please analyze this data and provide the following:

1. **Key Point Summary**:
   - Summarize the main ideas and conclusions discussed in each subject.
   - Note any unresolved issues or next steps.

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
`;


    const requestData = {
      data: [trimmedContext],
      headers: ['subject', 'createdAt', 'author', 'conversationParts'],
      question: question || defaultQuestion,
      promptType: "extractInfo",
    };

    setChatMessages((prev) => [...prev, { author: 'User', message: 'Adding to chat...' }]);
    handleSubmitToOpenAI(requestData);
    setIsChatOpen(true);
    setLoadingState(false);
  };

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
    <div className="space-y-4 mx-10">
      {/* Search and Date Range Inputs */}
      <div className="flex">
        <div className="flex flex-col w-1/3 pr-2">
          <div className="mb-3 text-lg">Search Term</div>
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-col w-1/3 pl-2">
          <div className="text-lg mb-3">Additional Questions</div>
          <Input
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center w-full space-x-4 mt-4 justify-between">
        {/* Date Range Inputs */}
        <div className="flex items-center">
          <div className="mr-4">
            <label>From:</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => handleDateChange(e, 'from')}
            />
          </div>
          <div>
            <label>To:</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => handleDateChange(e, 'to')}
            />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex items-center ml-auto">
          <button disabled={loadingState} onClick={handleResetFilters} className="btn bg-primary text-white mt-4">
            Reset Filters
          </button>
          <button disabled={loadingState} onClick={handleAddToChat} className="btn bg-primary text-white mt-4 ml-4">
            Add to Chat
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
