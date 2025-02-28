"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth-actions"; // Import the correct function
import Routes from "@/components/routes";
import { useToast } from "@/hooks/use-toast"; // Import the toast hook
import { ToastAction } from "@/components/ui/toast"; // Import the ToastAction component
import { Turnstile } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";

// Zod schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize the toast hook
  const [captchaToken, setCaptchaToken] = useState("");
  const { theme } = useTheme();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: { email: string }) => {
    setError(null); // Reset error before trying again

    try {
      const formData = new FormData();
      formData.append("captchaToken", captchaToken);
      formData.append("email", data.email);

      await forgotPassword(formData); // Call forgotPassword instead of signup

      // Reset the form after submission
      setCaptchaToken("");
      form.reset();

      // Show success toast notification
      toast({
        title: "Login Link Sent!",
        description:
          "If this email is associated with an account, a login link has been sent.",
        duration: Infinity,
        variant: "success",
      });
    } catch (err) {
      // console.log(err);
      setError("There was an error resetting your password. Please try again.");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email <br /> We&apos;ll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="user@quailbi.com"
              />
              {form.formState.errors.email && (
                <div className="text-red-500 text-sm">
                  {form.formState.errors.email?.message}
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Turnstile
                siteKey="0x4AAAAAAA-4oeMkEXIOQGB8"
                data-theme={theme === "dark" ? "dark" : "light"}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                }}
              />
            </div>
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </div>
        </form>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="mt-8 text-center text-sm">
          Know your password?{" "}
          <Link href={Routes.LoginPage} className="underline">
            Sign in
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href={Routes.SignUpPage} className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
