"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Settings2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { SettingsDialog } from "../settings/Settings";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const [clientUser, setClientUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setClientUser(user);
    };
    fetchUser();
  }, [supabase]);

  return (
    <>
      <SidebarMenu className="py-1">
        <SidebarMenuItem>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-accent hover:bg-muted rounded-md transition-colors py-2.5 px-2"
              >
                <Avatar className="h-8 w-8 rounded-md border">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-md border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-md bg-primary/10">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => {
                    setIsOpen(false);
                    const event = new CustomEvent("openSettings", {
                      detail: { section: "billing" },
                    });
                    window.dispatchEvent(event);
                  }}
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Billing
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(false);
                  signout();
                  setClientUser(null);
                }}
                className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <SettingsDialog />
    </>
  );
}
