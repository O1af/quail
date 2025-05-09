"use client";
import React, { useEffect, useState } from "react";
import Routes from "@/components/routes";
import Image from "next/image";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For client-side navigation
import { useTheme } from "next-themes";

const ResetPasswordPage = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const { resolvedTheme } = useTheme();

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href={Routes.Home}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <div className="relative h-full w-full">
              <Image
                src="/quail_logo.svg"
                fill
                className={`object-contain ${
                  resolvedTheme === "dark" ? "brightness-0 invert" : ""
                }`}
                alt="Avatar"
              />
            </div>
          </div>
          Quail
        </a>
        <ResetPasswordForm searchParams={{}} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
