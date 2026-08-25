'use client';

import React from 'react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

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
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full md:w-[60%] md:max-w-4xl flex flex-col overflow-hidden p-0"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle>{title}</SheetTitle>
                {badge}
              </div>
              {subtitle ? (
                <SheetDescription className="mt-0.5">{subtitle}</SheetDescription>
              ) : (
                <SheetDescription className="sr-only">{title} details</SheetDescription>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent transition-all duration-150" />
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
      </SheetContent>
    </Sheet>
  );
}
