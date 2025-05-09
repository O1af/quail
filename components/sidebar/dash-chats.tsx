"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import React Query hooks
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

async function fetchChats() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return listChats(user.id);
}

async function deleteChatMutation({
  chatId,
  userId,
}: {
  chatId: string;
  userId: string;
}) {
  await deleteChat(chatId, userId);
  return chatId;
}

async function renameChatMutation({
  chatId,
  userId,
  newTitle,
}: {
  chatId: string;
  userId: string;
  newTitle: string;
}) {
  await renameChat(chatId, userId, newTitle);
  return { chatId, newTitle };
}

export function NavChats() {
  const queryClient = useQueryClient(); // Get query client instance
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatListResponse | null>(
    null
  );
  const [newTitle, setNewTitle] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  // Fetch chats using React Query
  const {
    data: chats = [],
    isLoading: loading,
    error,
  } = useQuery<ChatListResponse[], Error>({
    queryKey: ["chats"],
    queryFn: fetchChats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Get user ID for mutations
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  // Mutation for deleting a chat
  const deleteMutation = useMutation({
    mutationFn: deleteChatMutation,
    onSuccess: (deletedChatId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      // If user is currently viewing this chat, redirect to /chat
      if (pathname === `/chat/${deletedChatId}`) {
        router.push("/chat");
      }
    },
    onError: (error) => {
      console.error("Failed to delete chat:", error);
      // TODO: Show error notification to user
    },
  });

  // Mutation for renaming a chat
  const renameMutation = useMutation({
    mutationFn: renameChatMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setIsRenameDialogOpen(false);
      setNewTitle("");
      setSelectedChat(null);
    },
    onError: (error) => {
      console.error("Failed to rename chat:", error);
      // TODO: Show error notification to user
    },
  });

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleDeleteChat = (chatId: string) => {
    if (!userId) return;
    deleteMutation.mutate({ chatId, userId });
  };

  const handleRenameChat = (chat: ChatListResponse) => {
    setSelectedChat(chat);
    setNewTitle(chat.title || "");
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (!userId || !selectedChat) return;
    renameMutation.mutate({
      chatId: selectedChat._id,
      userId,
      newTitle: newTitle.trim() || "New Chat", // Ensure title is not empty
    });
  };

  const isCurrentChat = (id: string) => pathname === `/chat/${id}`;
  const isNewChat = pathname === "/chat";

  // Handle error state
  if (error) {
    // Optionally render an error message or component
    console.error("Error loading chats:", error.message);
  }

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
                            handleRenameChat(chat); // Pass the whole chat object
                          }}
                          disabled={renameMutation.isPending}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteChat(chat._id)}
                          className="text-red-600"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables?.chatId === chat._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
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

      <Dialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedChat(null); // Clear selection when closing
            setNewTitle("");
          }
          setIsRenameDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new title"
            disabled={renameMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !renameMutation.isPending) {
                handleRenameSubmit();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={renameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={renameMutation.isPending || !newTitle.trim()}
            >
              {renameMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
