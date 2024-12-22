"use client";
import React, { useEffect, useState } from "react";
import { LoginForm } from "./components/LoginForm";
import Routes from "@/components/routes";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For client-side navigation

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
    <div className="flex h-svh items-center">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
