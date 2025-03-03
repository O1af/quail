"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import CodeTool from "@editorjs/code";
import Table from "@editorjs/table";
import { createNote, updateNote, loadNote } from "@/lib/actions/noteActions";
import { useDebounce } from "@/lib/hooks/useDebounce";

type NotesEditorProps = {
  userId: string;
  noteId: string | null;
};

export function NotesEditor({ userId, noteId }: NotesEditorProps) {
  const [editor, setEditor] = useState<EditorJS | null>(null);
  const [title, setTitle] = useState<string>("Untitled Note");
  const [content, setContent] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [noteData, setNoteData] = useState<any>(null);
  const router = useRouter();

  // Debounced auto-save
  const debouncedContent = useDebounce(content, 2000);

  // Initialize Editor when component mounts
  useEffect(() => {
    if (!editor && typeof window !== "undefined") {
      const newEditor = new EditorJS({
        holder: "editorjs",
        tools: {
          header: {
            class: Header,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          code: CodeTool,
          table: {
            class: Table,
            inlineToolbar: true,
          },
        },
        placeholder: "Let's write some insights...",
        onChange: async (api) => {
          const editorData = await api.saver.save();
          setContent(editorData);
        },
      });

      setEditor(newEditor);

      return () => {
        newEditor.isReady.then(() => {
          newEditor.destroy();
        });
      };
    }
  }, []);

  // Load note data when noteId changes
  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId || !userId) {
        return;
      }

      setIsLoading(true);
      try {
        const note = await loadNote(noteId, userId);
        if (note) {
          setNoteData(note);
          setTitle(note.title);

          // Reset editor content
          if (editor && editor.isReady) {
            editor.isReady.then(() => {
              if (note.content) {
                editor.render(note.content);
              } else {
                editor.clear();
              }
            });
          }
        }
      } catch (error) {
        console.error("Error loading note:", error);
        toast.error("Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, userId, editor]);

  // Create a new note
  const handleCreateNote = async () => {
    setIsLoading(true);
    try {
      const editorContent = editor ? await editor.save() : {};

      const newNote = await createNote({
        userId,
        title: "Untitled Note",
        content: editorContent,
      });

      if (newNote) {
        toast.success("Note created successfully");
        router.push(`/notes?id=${newNote._id}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsLoading(false);
    }
  };

  // Save note manually
  const handleSave = async () => {
    if (!noteId || !userId) {
      await handleCreateNote();
      return;
    }

    setIsSaving(true);
    try {
      const editorContent = editor ? await editor.save() : {};

      const success = await updateNote(noteId, userId, {
        title,
        content: editorContent,
      });

      if (success) {
        toast.success("Note saved successfully");
      } else {
        toast.error("Failed to save note");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    const autoSave = async () => {
      if (!noteId || !userId || !content || Object.keys(content).length === 0) {
        return;
      }

      try {
        await updateNote(noteId, userId, {
          title,
          content: content,
        });
        // Silently save without notification
      } catch (error) {
        console.error("Error auto-saving note:", error);
        // Don't show error for auto-save to avoid spamming
      }
    };

    if (debouncedContent && Object.keys(debouncedContent).length > 0) {
      autoSave();
    }
  }, [debouncedContent, noteId, userId, title]);

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : noteId ? (
        <>
          <div className="p-4 border-b flex justify-between items-center">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Untitled Note"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save
            </Button>
          </div>
          <Separator />
          <div className="flex-1 overflow-auto p-4">
            <div
              id="editorjs"
              className="prose dark:prose-invert max-w-none"
            ></div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-medium">No Note Selected</h3>
          <p className="text-muted-foreground">
            Select a note from the sidebar or create a new one
          </p>
          <Button onClick={handleCreateNote} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Create New Note
          </Button>
        </div>
      )}
    </div>
  );
}
