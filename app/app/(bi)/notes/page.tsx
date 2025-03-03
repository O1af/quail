"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { NotesEditor } from "./components/NotesEditor";
import { NotesList } from "./components/NotesList";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);
      setIsLoading(false);
    };

    fetchUser();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 border-r overflow-auto">
        <NotesList
          userId={user.id}
          onNoteSelect={setSelectedNoteId}
          selectedNoteId={selectedNoteId}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <NotesEditor userId={user.id} noteId={selectedNoteId} />
      </div>
    </div>
  );
}
