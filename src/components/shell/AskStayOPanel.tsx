'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AgentPanel, ChatMessage } from '@/components/patterns/AgentPanel';
import { X, Sparkles } from 'lucide-react';

interface AskStayOPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskStayOPanel({ open, onOpenChange }: AskStayOPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ask-1',
      sender: 'agent',
      text: 'Hello! I am your StayO Operational Co-pilot. You can ask me to inspect pending arrivals, check rate pace, or draft a guest WhatsApp message.',
      timestamp: 'Active Now',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const agentReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: `Understood. Analyzing operations for "${text}". All systems are running on schedule.`,
        timestamp: 'Just now',
        structuredData: [
          { label: 'Occupancy Pace', value: '72%', subtext: 'Normal for Thursday' },
          { label: 'Pending Requests', value: '2 Waiting', subtext: 'Towels · Late Checkout' },
        ],
      };
      setMessages((prev) => [...prev, agentReply]);
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="flex flex-col p-0">
        <div className="p-3.5 bg-surface border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent/20 text-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <SheetTitle className="font-semibold text-body-sm text-foreground">Ask StayO AI</SheetTitle>
            <SheetDescription className="sr-only">Chat with the StayO operational co-pilot</SheetDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-3">
          <AgentPanel
            title="Context Co-pilot"
            agentName="StayO Intelligence"
            messages={messages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
