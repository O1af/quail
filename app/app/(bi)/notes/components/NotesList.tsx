"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  FileText,
  Search,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  loadUserNotes,
  createNote,
  deleteNote,
} from "@/lib/actions/noteActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type NotesListProps = {
  userId: string;
  selectedNoteId: string | null;
  onNoteSelect: (id: string) => void;
};

export function NotesList({
  userId,
  selectedNoteId,
  onNoteSelect,
}: NotesListProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch notes from the database
  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const userNotes = await loadUserNotes(userId);
        setNotes(userNotes);
      } catch (error) {
        console.error("Error loading notes:", error);
        toast.error("Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  // Create a new note
  const handleCreateNote = async () => {
    if (!userId) return;

    setIsCreating(true);
    try {
      const newNote = await createNote({
        userId,
        title: "Untitled Note",
        content: {},
      });

      if (newNote) {
        setNotes((prevNotes) => [newNote, ...prevNotes]);
        onNoteSelect(newNote._id);
        toast.success("Note created successfully");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async () => {
    if (!noteToDelete || !userId) return;

    try {
      const success = await deleteNote(noteToDelete, userId);

      if (success) {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteToDelete)
        );

        // If the deleted note was selected, clear selection
        if (selectedNoteId === noteToDelete) {
          onNoteSelect("");
        }

        toast.success("Note deleted successfully");
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  // Filter notes based on search query
  const filteredNotes =
    searchQuery.trim() === ""
      ? notes
      : notes.filter((note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={handleCreateNote}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          New Note
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-1">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={cn(
                  "flex items-center justify-between rounded-md p-2 cursor-pointer",
                  selectedNoteId === note._id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                )}
                onClick={() => onNoteSelect(note._id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {note.title || "Untitled Note"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {note.updatedAt
                        ? formatDistanceToNow(new Date(note.updatedAt), {
                            addSuffix: true,
                          })
                        : "Just now"}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note._id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium">No notes found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim() !== ""
                ? `No results for "${searchQuery}"`
                : "Create your first note to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
