import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChatInput } from './ChatInput';
import { filterConversationParts } from '@/lib/utils/conversation';
import type { Conversation } from '@/types';

interface ChatWidgetProps {
  selectedData: Conversation | null;
}

export function ChatWidget({ selectedData }: ChatWidgetProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedData || loading) return;

    try {
      setLoading(true);
      
      // Prepare filtered data for OpenAI
      const messages = filterConversationParts(selectedData);
      const relevantData = {
        subject: selectedData.source?.subject,
        messages: messages.map(msg => ({
          role: msg.author.type === 'admin' ? 'assistant' : 'user',
          content: msg.body
        })).slice(-5) // Only send last 5 messages
      };

      console.log('Sending to OpenAI:', { prompt, relevantData });
      setPrompt('');
    } catch (error) {
      console.error('Error sending to OpenAI:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedData) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Chat Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <p className="text-muted-foreground">
            Select a conversation to analyze with AI
          </p>
        </CardContent>
      </Card>
    );
  }

  const messages = filterConversationParts(selectedData);

  return (
   <Card className="h-[600px] flex flex-col">
  <CardHeader className="border-b">
    <CardTitle className="flex items-center justify-between">
      <span>Chat Analysis</span>
      <span className="text-sm font-normal text-muted-foreground">
        {messages.length} messages
      </span>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="flex-1 flex flex-col p-0">
    {/* Scrollable container */}
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={index} className="flex gap-2 mb-4">
          {/* Avatar */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            {message.author.type === 'admin' ? 'B' : 'U'}
          </div>
          {/* Message */}
          <div className="flex-1 p-2 rounded-md bg-gray-100">
            <div className="font-semibold">{message.author.name}</div>
            <div className="text-sm">{message.body}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Chat Input */}
    <div className="p-4 border-t">
      <ChatInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disabled={loading}
      />
    </div>
  </CardContent>
</Card>

  );
}