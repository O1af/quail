"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  ChevronRight,
  SquarePen,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatListResponse } from "@/lib/types/stores/chat";
import { listChats, deleteChat, renameChat } from "../stores/chat_store";
import { createClient } from "@/utils/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NavChats() {
  const [chats, setChats] = useState<ChatListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();

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

  const handleDeleteChat = async (chatId: string) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await deleteChat(chatId, user.id);
        // Remove the chat from the state
        setChats(chats.filter((chat) => chat._id !== chatId));
        // If user is currently viewing this chat, redirect to /chat
        if (pathname === `/chat/${chatId}`) {
          router.push("/chat");
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleRenameChat = async (chatId: string) => {
    const chat = chats.find((c) => c._id === chatId);
    setSelectedChatId(chatId);
    setNewTitle(chat?.title || "");
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    try {
      setIsRenaming(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await renameChat(selectedChatId, user.id, newTitle);
        // Update the chat title in the local state
        setChats(
          chats.map((chat) =>
            chat._id === selectedChatId ? { ...chat, title: newTitle } : chat
          )
        );
        setIsRenameDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to rename chat:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const isCurrentChat = (id: string) => pathname === `/chat/${id}`;
  const isNewChat = pathname === "/chat";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-2">
      <SidebarGroup>
        <div className="flex items-center w-full">
          <CollapsibleTrigger className="flex-1">
            <SidebarGroupLabel className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors">
              <ChevronRight
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Chats</span>
            </SidebarGroupLabel>
          </CollapsibleTrigger>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewChat();
                  }}
                  className={`p-1.5 hover:bg-accent rounded-md cursor-pointer transition-colors ${
                    isNewChat ? "bg-sidebar-accent/80" : ""
                  }`}
                >
                  <SquarePen className="h-3.5 w-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CollapsibleContent>
          <SidebarGroupContent className="pl-6 pr-1">
            <SidebarMenu>
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat._id} className="mb-0.5">
                    <SidebarMenuButton
                      onClick={() => router.push(`/chat/${chat._id}`)}
                      isActive={isCurrentChat(chat._id)}
                      className="group rounded-md transition-all duration-200 py-1.5"
                    >
                      <span className="truncate text-sm">
                        {chat.title || "New Chat"}
                      </span>
                    </SidebarMenuButton>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction
                          showOnHover
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48"
                        side="right"
                        align="start"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            handleRenameChat(chat._id);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteChat(chat._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new title"
            disabled={isRenaming}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={isRenaming}>
              {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
