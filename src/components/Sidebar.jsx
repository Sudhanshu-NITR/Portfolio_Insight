"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useSession, signOut } from "next-auth/react";
import {
  BarChart3, TrendingUp, Wallet, MessageSquare, Home, Plus, Bell, LogOut
} from 'lucide-react';

export default function MainAppLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('dark-mode') === 'true';
    } catch {
      return false;
    }
  });
  const [showAddHolding, setShowAddHolding] = useState(false);

  // Apply dark mode and persist
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('dark-mode', 'true'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('dark-mode', 'false'); } catch {}
    }
  }, [darkMode]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'holdings', label: 'Holdings', icon: Wallet, href: '/holdings' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'ai-insights', label: 'AI Insights', icon: MessageSquare, href: '/ai-insights' },
  ];

  // Simple loading state to prevent layout flicker while session resolves
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // Helper for avatar fallback initial
  const avatarInitial = session?.user?.name?.[0] ??
                        session?.user?.email?.[0] ??
                        '?';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-4 py-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">PortfolioInsight</h2>
                <p className="text-xs text-muted-foreground">India</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="w-full"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="mt-auto p-4">
              <Button onClick={() => setShowAddHolding(true)} className="w-full mb-4" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Holding
              </Button>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm">Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              {session ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{avatarInitial.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user?.name ?? session.user?.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-8 h-8 p-0">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                // If no session, you might still want to show a sign-in CTA instead of nothing
                <div className="text-sm text-muted-foreground">Not signed in</div>
              )}
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <Button variant="ghost" size="sm" aria-label="Notifications">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
