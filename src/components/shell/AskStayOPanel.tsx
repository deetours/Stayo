'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentPanel, ChatMessage } from '@/components/patterns/AgentPanel';
import { durations, eases } from '@/lib/motion';
import { X, Sparkles } from 'lucide-react';

interface AskStayOPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AskStayOPanel({ isOpen, onClose }: AskStayOPanelProps) {
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-xs"
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: durations.standard, ease: eases.decelerate }}
            className="relative z-10 w-full md:w-[420px] h-full bg-surface border-l border-border shadow-[var(--shadow-e3)] flex flex-col"
          >
            <div className="p-3.5 bg-surface border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-accent/20 text-accent flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-body-sm text-foreground">Ask StayO AI</span>
              </div>
              <button
                onClick={onClose}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}