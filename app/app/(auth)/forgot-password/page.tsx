"use client";
import React, { useEffect, useState } from "react";
import Routes from "@/components/routes";
import Image from "next/image";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For client-side navigation
import { useTheme } from "next-themes";
import botIconDark from "@/assets/boticondark.png";

const ForgotPasswordPage = () => {
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
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href={Routes.Home}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <div className="relative h-full w-full">
              <Image
                src={avatarSrc}
                fill
                className="object-contain"
                alt="Avatar"
              />
            </div>
          </div>
          Quail
        </a>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
