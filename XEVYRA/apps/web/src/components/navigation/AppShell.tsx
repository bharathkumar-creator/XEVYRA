'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { ToastProvider } from '../feedback/Toast';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  return (
    <ToastProvider>
      {isAuthPage ? (
        <div className="min-h-screen bg-background-deep text-text-primary">
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-background-deep text-text-primary flex">
          {/* Desktop Left Sidebar */}
          <DesktopSidebar />

          {/* Main App Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader />
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <MobileBottomNav />
          </div>
        </div>
      )}
    </ToastProvider>
  );
};
