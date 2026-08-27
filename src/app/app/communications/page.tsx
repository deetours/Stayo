'use client';

import React, { useState } from 'react';
import { usePropertyData, MockMessage } from '@/lib/mock-data';
import { Search, Send, User } from 'lucide-react';

export default function CommunicationsPage() {
  const { mockMessages } = usePropertyData();
  const [activeMessageId, setActiveMessageId] = useState<string | null>(mockMessages[0]?.id || null);

  const activeMessage = mockMessages.find(m => m.id === activeMessageId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-sans">
      <div className="mb-4">
        <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">Communications</h1>
        <p className="text-body-sm text-muted-foreground mt-1">Unified inbox for guest messages.</p>
      </div>

      <div className="flex-1 flex overflow-hidden border border-border rounded-md bg-surface shadow-e0">
        {/* Left sidebar: Message list */}
        <div className="w-80 flex flex-col border-r border-border bg-surface-2/30">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 bg-surface text-body-sm text-foreground border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => setActiveMessageId(msg.id)}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  activeMessageId === msg.id ? 'bg-accent/10 border-l-2 border-l-accent' : 'hover:bg-surface-2'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`font-semibold text-body-sm ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {msg.guestName}
                  </span>
                  <span className="text-caption text-muted-foreground font-mono">{msg.time}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <p className={`text-body-sm truncate ${msg.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {msg.preview}
                  </p>
                  {msg.unread && <span className="w-2 h-2 bg-accent rounded-full shrink-0"></span>}
                </div>
              </div>
            ))}
            {mockMessages.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-body-sm italic">
                No active conversations.
              </div>
            )}
          </div>
        </div>

        {/* Right side: Chat pane */}
        <div className="flex-1 flex flex-col bg-surface">
          {activeMessage ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-body-md">{activeMessage.guestName}</h3>
                    <span className="text-caption text-muted-foreground">via {activeMessage.channel}</span>
                  </div>
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-start">
                  <div className="bg-surface-2 border border-border text-foreground px-4 py-2.5 rounded-lg rounded-tl-none max-w-[80%] text-body-sm">
                    {activeMessage.preview}
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">{activeMessage.time}</div>
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-border bg-surface-2/50">
                <div className="relative flex items-end gap-2">
                  <textarea 
                    className="flex-1 bg-surface border border-border text-foreground rounded-md text-body-sm p-3 min-h-[60px] max-h-[150px] focus:outline-none focus:ring-1 focus:ring-accent resize-y"
                    placeholder="Type your reply..."
                  ></textarea>
                  <button className="h-10 px-4 rounded-md bg-accent text-accent-foreground font-semibold flex items-center gap-2 hover:opacity-90">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-body-sm">
              Select a conversation to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
