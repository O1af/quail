"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, MessageSquare } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChatListResponse } from "@/lib/types/chat";
import { listChats } from "../stores/chat_store";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavChats() {
  const [chats, setChats] = useState<ChatListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const chatList = await listChats(user.id);
          setChats(chatList);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [pathname]); // Reload when pathname changes (new chat created)

  // Add listener for chat updates
  useEffect(() => {
    const handleChatUpdate = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const chatList = await listChats(user.id);
        setChats(chatList);
      }
    };
    window.addEventListener("chatUpdated", handleChatUpdate);
    return () => window.removeEventListener("chatUpdated", handleChatUpdate);
  }, []);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const isCurrentChat = (id: string) => pathname === `/chat/${id}`;
  const isNewChat = pathname === "/chat";

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="group-data-[collapsible=icon]:hidden">Chats</span>
        <TooltipProvider>
          <div className="absolute top-2 right-2 group-data-[collapsible=icon]:hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleNewChat}
                  className={`p-1 hover:bg-accent rounded-sm ${
                    isNewChat ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </SidebarGroupLabel>
      <SidebarMenu>
        {loading ? (
          // Loading skeletons
          <>
            {[...Array(5)].map((_, i) => (
              <SidebarMenuItem
                key={i}
                className="group-data-[collapsible=icon]:hidden"
              >
                <div className="px-2 py-1">
                  <Skeleton className="h-5 w-full" />
                </div>
              </SidebarMenuItem>
            ))}
          </>
        ) : (
          chats.map((chat) => (
            <SidebarMenuItem
              key={chat._id}
              className="group-data-[collapsible=icon]:hidden"
            >
              <SidebarMenuButton
                onClick={() => router.push(`/chat/${chat._id}`)}
                className={isCurrentChat(chat._id) ? "bg-sidebar-accent" : ""}
              >
                <span className="truncate">{chat.title || "New Chat"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
