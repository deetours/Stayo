'use client';

import React, { useState } from 'react';
import { Bot, User, Send, Check, X, Edit3, ArrowRight } from 'lucide-react';

export interface ProposedAction {
  id: string;
  title: string;
  description: string;
  type: 'booking' | 'task' | 'pricing' | 'message';
  details?: Record<string, string>;
  status?: 'pending' | 'approved' | 'rejected' | 'applied';
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
  proposedAction?: ProposedAction;
  structuredData?: {
    label: string;
    value: string;
    subtext?: string;
  }[];
}

export interface AgentPanelProps {
  title?: string;
  agentName?: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onApproveAction?: (actionId: string) => void;
  onRejectAction?: (actionId: string) => void;
  onEditAction?: (actionId: string) => void;
  isThinking?: boolean;
}

export function AgentPanel({
  title = 'StayO AI Workspace',
  agentName = 'Reservation Agent',
  messages,
  onSendMessage,
  onApproveAction,
  onRejectAction,
  onEditAction,
  isThinking,
}: AgentPanelProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-md overflow-hidden shadow-[var(--shadow-e0)]">
      {/* Header */}
      <div className="p-4 bg-surface border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-body-md font-semibold text-foreground leading-none">{title}</h4>
            <span className="text-caption text-muted-foreground">{agentName}</span>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-caption font-medium ${
                  isAgent
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'bg-surface-2 text-muted-foreground border border-border'
                }`}
              >
                {isAgent ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div className="space-y-2">
                {/* Chat Bubble */}
                <div
                  className={`p-3 rounded-md text-body-md leading-relaxed ${
                    isAgent
                      ? 'bg-surface-2 text-foreground border border-border'
                      : 'bg-accent text-accent-foreground font-medium'
                  }`}
                >
                  {msg.text}

                  {/* Optional structured metric row */}
                  {msg.structuredData && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60">
                      {msg.structuredData.map((d, i) => (
                        <div key={i} className="p-2 bg-surface rounded-sm border border-border">
                          <div className="text-caption text-muted-foreground">{d.label}</div>
                          <div className="font-mono text-body-md font-semibold text-foreground">
                            {d.value}
                          </div>
                          {d.subtext && (
                            <div className="text-[11px] text-accent mt-0.5">{d.subtext}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Proposed Action Card (Distinct Bordered Card, NOT bubble) */}
                {msg.proposedAction && (
                  <div className="p-3.5 rounded-md bg-surface border border-accent/50 shadow-[var(--shadow-e1)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wider text-accent">
                        <span>Proposed Action</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground capitalize">
                          {msg.proposedAction.type}
                        </span>
                      </div>
                      {msg.proposedAction.status && (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted-foreground">
                          {msg.proposedAction.status}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="font-medium text-body-md text-foreground">
                        {msg.proposedAction.title}
                      </div>
                      <p className="text-body-sm text-muted-foreground mt-0.5">
                        {msg.proposedAction.description}
                      </p>
                    </div>

                    {msg.proposedAction.details && (
                      <div className="p-2 bg-surface-2 rounded-sm border border-border text-body-sm divide-y divide-border/60">
                        {Object.entries(msg.proposedAction.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between py-1 first:pt-0 last:pb-0">
                            <span className="text-muted-foreground">{k}</span>
                            <span className="font-mono font-medium text-foreground">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Card Buttons */}
                    {(!msg.proposedAction.status || msg.proposedAction.status === 'pending') && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onApproveAction?.(msg.proposedAction!.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm bg-accent text-accent-foreground text-body-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => onEditAction?.(msg.proposedAction!.id)}
                          className="inline-flex items-center justify-center p-1.5 rounded-sm bg-surface-2 border border-border text-foreground hover:bg-border transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRejectAction?.(msg.proposedAction!.id)}
                          className="inline-flex items-center justify-center p-1.5 rounded-sm bg-surface-2 border border-border text-status-crit hover:bg-status-crit/10 transition-colors cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] font-mono text-muted-foreground/60 px-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator (3-dot pulse) */}
        {isThinking && (
          <div className="flex items-center gap-2 text-muted-foreground text-body-sm p-2 bg-surface-2 rounded-md border border-border w-fit">
            <Bot className="w-4 h-4 text-accent animate-pulse" />
            <span>StayO is thinking</span>
            <div className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="p-3 bg-surface border-t border-border flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask StayO anything or instruct an agent..."
          className="flex-1 bg-surface-2 border border-border rounded-sm px-3.5 py-2 text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-sm bg-accent text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}


