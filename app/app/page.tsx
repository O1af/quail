"use client";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ResizableDisplay } from "@/components/ResizableDisplay";
import { ModeToggle } from "@/components/mode-toggle";
import Routes from "@/components/routes";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For client-side navigation

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push(Routes.LoginPage);
      }
    };
    fetchUser();
  }, [router, supabase]);
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex items-center gap-2 px-4 ml-auto">
          <ModeToggle />
        </div>
      </header>
      <ResizableDisplay />
    </>
  );
}
