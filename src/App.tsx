import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { ConversationTable } from '@/components/ConversationTable';
import { ChatWidget } from '@/components/ChatWidget';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import type { Conversation } from '@/types';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedData, setSelectedData] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatData, setChatData] = useState<string[]>([]); 
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const fromParam = params.get('from');
    const toParam = params.get('to');

    if (searchParam) setSearch(searchParam);
    if (fromParam) setDateRange((prev) => ({ ...prev, from: fromParam }));
    if (toParam) setDateRange((prev) => ({ ...prev, to: toParam }));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (dateRange.from) params.set('from', dateRange.from);
    if (dateRange.to) params.set('to', dateRange.to);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }, [search, dateRange]);

  return (
    <div className="max-h-screen bg-background p-8 w-screen overflow-hidden">
      <div className="mx-auto max-w-10xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Conversation Analyzer</h1>
          <FileUploader 
            onUpload={(data) => {
              setConversations(data);
              setLoading(false);
              // Apply filters based on URL parameters
              setSearch(search); // Ensure search is set from URL
              setDateRange((prev) => ({
                ...prev,
                from: dateRange.from || '', // Ensure from date is set from URL
                to: dateRange.to || '' // Ensure to date is set from URL
              }));
            }}  
            setLoading={setLoading}
          >
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload JSONL
            </Button>
            
          </FileUploader>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <ConversationTable 
              conversations={conversations} 
              loading={loading}
              onSelect={setSelectedData}
              setChatData={setChatData}
              search={search}
              setSearch={setSearch}
              dateRange={dateRange}
              setDateRange={setDateRange}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
            />
          </div>
          <div className="lg:col-span-2">
            <ChatWidget
             conversations={conversations} 
             selectedData={selectedData}
              chatData={chatData}
              setChatData={setChatData}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;