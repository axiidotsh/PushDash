'use client';

import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { UserMenu } from './user-menu';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  {
    title: 'Dashboard',
    to: '/dashboard' as const,
    icon: LayoutDashboard,
  },
];

export function AppShell({ children }: AppShellProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="none" className="h-screen border-r">
        <SidebarHeader className="border-b px-4 py-4">
          <Link to="/" className="text-foreground text-base font-medium">
            PushDash
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = currentPath.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.to}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <UserMenu />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
