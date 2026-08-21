'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { durations, eases } from '@/lib/motion';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  tabs,
  activeTab,
  onTabChange,
  children,
  footerActions,
}: DetailDrawerProps) {
  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.standard, ease: eases.standard }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: durations.standard,
              ease: eases.decelerate,
            }}
            className="relative z-10 w-full md:w-[60%] max-w-4xl h-full bg-surface border-l border-border shadow-[var(--shadow-e3)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-heading-md font-semibold text-foreground tracking-tight">
                      {title}
                    </h3>
                    {badge}
                  </div>
                  {subtitle && (
                    <p className="text-body-sm text-muted-foreground mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar (Sub-header) */}
            {tabs && tabs.length > 0 && (
              <div className="bg-surface border-b border-border px-6 flex items-center gap-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange?.(tab.id)}
                      className={`relative py-3 text-body-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`font-mono text-caption px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-accent/15 text-accent'
                              : 'bg-surface-2 text-muted-foreground'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeDrawerTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                          transition={{ duration: durations.fast, ease: eases.standard }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

            {/* Footer Actions */}
            {footerActions && (
              <div className="sticky bottom-0 z-20 bg-surface/95 backdrop-blur-xs border-t border-border px-6 py-3.5 flex items-center justify-end gap-3 shadow-[var(--shadow-e1)]">
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
