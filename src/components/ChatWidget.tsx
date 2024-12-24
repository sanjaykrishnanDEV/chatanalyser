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
  chatHistory: string[];
  setChatHistory: (history: string[]) => void;
  context: string[];
}

export function ChatWidget({
  selectedData,
  chatHistory,
  setChatHistory,
  chatData,
  conversations,
  setChatData,
  context
}: ChatWidgetProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

   useEffect(() => {
    if (context) {
      console.log("context from widget:", context);
    }
  }, [context]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const dataToSend = selectedData || conversations;
    if (!dataToSend) {
      console.error('No data to send to the server.');
      toast.error("No data sent to server")
      setLoading(false);
      return;
    }

    
  
    const requestData = {
      data: context,
      headers: ['subject', 'createdAt', 'author', 'conversationParts'],
      question: prompt ,
      promptType: 'extractInfo',
    };

    try {
      // console.log('Sending to OpenAI backend:', requestData);

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
      //@ts-ignore
      setChatHistory((prev: any) => [...prev, `User: ${prompt}`, `AI: ${aiResponse}`]);
      //@ts-ignore
      setChatData((prev: any) => [...prev, aiResponse]); // Add AI response to chatData
      setPrompt('');
    } catch (error) {
      console.error('Error during API submission:', error);
      toast.error('Error during API submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-h-[800px] flex flex-col overflow-y-scroll">
      <CardHeader>
        <CardTitle>AI Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            <div className="p-3 rounded-lg text-lg text-black mr-4 text-left">
              <pre className="text-lg">Initial prompt</pre>
              ------------------------------------
              <pre className="text-sm p-6">
                {`You're an expert CSM analysing intercom past chats

Conversation data is provided in the following format:
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

conversation data follows
---`}
              </pre>
            </div>

            {chatData.length > 0 && (
              <div className="p-3 rounded-lg bg-muted text-left">
                <h2 className="font-semibold text-xl mb-2">Initial Analysis</h2>
                <div>
                  {chatData[0].split('\n').map((line, i) => (
                    <p key={i} className="mb-2">
                      {line.startsWith('**') ? (
                        <span className="font-bold">{line.replace(/\*\*/g, '')}</span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((message, index) => {
  const [prefix, ...contentParts] = message.split(': ');
  const content = contentParts.join(': ');

  return (
    <div key={index} className="p-3 rounded-lg bg-black text-white mr-4 text-left">
      <div className="font-bold mb-2">{prefix}:</div>
      {prefix.includes('AI') ? (
        <div className="space-y-4">
          {content.split(/\d+\.\s+/).filter(Boolean).map((section, idx) => {
            const [title, ...details] = section.split(':');
            // Remove asterisks from the title
            const cleanTitle = title.replace(/\*\*/g, '');
            return (
              <div key={idx} className="ml-2">
                <div className="font-semibold">{cleanTitle.trim()}:</div>
                {details.length > 0 && (
                  <div className="ml-4">
                    {details.join(':').split('-').map((detail, detailIdx) => {
                      // Remove asterisks from the details
                      const cleanDetail = detail.replace(/\*\*/g, '');
                      return cleanDetail.trim() && (
                        <div key={detailIdx} className="text-sm">
                          • {cleanDetail.trim()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-md">{content}</p>
      )}
    </div>
  );
})}
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
            <div className="flex flex-col gap-1 justify-between">
              <Button type="submit" size="sm" disabled={loading} title="Send chat">
                {loading ? <span>Loading...</span> : <SendHorizontal className="h-4 w-4" />}
              </Button>
              <Button
                title="Clear chat"
                className="bg-red-800"
                type="button"
                size="sm"
                disabled={loading}
                onClick={() => {
                  setChatData([]);
                  setChatHistory([]);
                }}
              >
                {loading ? <span>Loading...</span> : <StopCircle className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
