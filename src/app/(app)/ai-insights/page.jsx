'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { MessageSquare, Send, Bot, User } from 'lucide-react';

const initialMessages = [
  {
    id: '1',
    type: 'ai',
    content: "Hello! I'm your AI portfolio advisor. I can help you analyze your investments, answer financial questions, and provide personalized recommendations. How can I assist you today?",
    timestamp: new Date()
  }
];

export default function AIChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getAIResponse = async (userMessage) => {
    console.log(process.env.NEXT_PUBLIC_FLASK_BACKEND_URL);
    
    const response = await axios.post(`${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/chat`, {
      message: userMessage
    });
    // const response = await axios.get(`{}`);
    // Adjust property if your response is different
    return response.data.reply || 'No response from AI.';
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiReply = await getAIResponse(content);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiReply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (e) {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I could not get a response. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chatbot
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your portfolio, market trends, or investment advice..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
