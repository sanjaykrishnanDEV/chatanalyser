import { useState } from 'react';
import { SendHorizontal, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Conversation } from '@/types';
import { toast } from 'sonner';
interface ChatWidgetProps {
  selectedData: Conversation | null;
  chatData: string[];
  conversations: any;
  setChatData: (data: string[]) => void;
}

export function ChatWidget({ selectedData, chatData, conversations, setChatData }: ChatWidgetProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = selectedData || conversations;
    if (!dataToSend) {
      console.error("No data to send to the server.");
      setLoading(false);
      return;
    }

    const context = dataToSend.map((conv: { source: { subject: any; author: { name: any; }; }; created_at: any; conversation_parts: { conversation_parts: any[]; }; }) => ({
      subject: conv.source?.subject,
      createdAt: conv.created_at,
      author: conv.source?.author?.name ?? 'Unknown',
      conversationParts: conv.conversation_parts.conversation_parts.map(part => ({
        body: part.body,
        authorName: part.author?.name ?? 'Unknown',
      })),
    }));

    const estimateTokenCount = (text: string) => {
      return Math.ceil(text.split(/\s+/).length / 4);
    };

    const allText = context
      .map((conv: { subject: any; author: any; conversationParts: any[]; }) => `${conv.subject} ${conv.author} ${conv.conversationParts.map((part: { body: any; }) => part.body).join(' ')}`)
      .join(' ');

    const totalTokens = estimateTokenCount(allText);
    const maxTokens = 12000;

    let trimmedContext = context;

    if (totalTokens > maxTokens) {
      let tokenCount = 0;
      trimmedContext = [];

      for (const conv of context) {
        const conversationText = `${conv.subject} ${conv.author} ${conv.conversationParts.map((part: { body: any; }) => part.body).join(' ')}`;
        const conversationTokens = estimateTokenCount(conversationText);

        if (tokenCount + conversationTokens > maxTokens) break;
        trimmedContext.push(conv);
        tokenCount += conversationTokens;
      }
    }

    const defaultQuestion = `
    Given the following conversation data:
    - Subjects, authors, and creation dates are provided for each context.
    - Each context includes detailed conversation parts with their respective authors.
    
    Please provide:
    1. A summary of key points discussed across all subjects.
    2. An analysis of the most frequent themes or topics covered.
    3. Suggestions for improving the communication based on the conversation details.
    `;

    const requestData = {
      data: [chatData],
      headers: ['subject', 'createdAt', 'author', 'conversationParts'],
      question: prompt || defaultQuestion,
      promptType: "extractInfo",
    };

    try {
      console.log("Sending to OpenAI backend:", requestData);

      const response = await fetch('https://gpt-be.onrender.com/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.message;
      
      setChatHistory(prev => [...prev, `User: ${prompt}`, `AI: ${aiResponse}`]);
      // @ts-ignore
      setChatData((prev: any) => [...prev, aiResponse]);
      setPrompt('');
    } catch (error) {
      console.error("Error during API submission:", error);
     
      toast.error("Error during API submission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-h-[900px] flex flex-col overflow-y-scroll">
      <CardHeader>
        <CardTitle>AI Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
          {/* {chatData.map((message, index) => (
  <div key={index} className="p-3 rounded-lg bg-muted mr-4 ml-auto text-right">
    <p className="text-md">User: {message}</p>
  </div>
))} */}
 {chatData.length > 0 && (
  <div className="p-3 rounded-lg bg-muted mr-4 ml-auto text-right">
    {/* <p className="text-lg">User</p> */}
    <p className="text-md">{chatData[0]}</p>
  </div>
)}
{chatHistory.map((message, index) => (
  <div key={index} className="p-3 rounded-lg text-lg bg-black text-white mr-4 text-left">
    <p className="text-md">{message}</p>
  </div>
))}
            {loading && <p>Loading...</p>}
          </div>
        </ScrollArea>

        {chatData.length > 0 && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI about this conversation..."
              className="min-h-[80px]"
            />
            <div className=' flex flex-col gap-1 justify-between'>
            <Button type="submit" size="sm" disabled={loading} title="Send chat">
              {loading ? <span>Loading...</span> : <SendHorizontal className="h-4 w-4" />}
            </Button>
            <Button  title="Clear chat" className='bg-red-800' type="button" size="sm" disabled={loading} onClick={() => {
              setChatData([]);
              setChatHistory([]);
            }}>
              {loading ? <span>Loading...</span> : <StopCircle className="h-4 w-4" />}
            </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
