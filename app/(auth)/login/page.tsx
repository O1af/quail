"use client";
import React, { useEffect, useState } from "react";
import { LoginForm } from "./components/LoginForm";
import Routes from "@/components/routes";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For client-side navigation
import { GalleryVerticalEnd } from "lucide-react";

const LoginPage = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        router.push(Routes.Page);
      }
    };
    fetchUser();
  }, [router, supabase]);
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href={Routes.Home}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            {/*TODO: Replace with Logo*/}
            <GalleryVerticalEnd className="size-4" />
          </div>
          Quail
        </a>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
