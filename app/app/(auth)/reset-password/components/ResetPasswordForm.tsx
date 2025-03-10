"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { useToast } from "@/hooks/use-toast"; // Import the toast hook
import { ToastAction } from "@/components/ui/toast"; // Import the ToastAction component
import { resetPassword } from "@/lib/auth-actions"; // Replace with your actual resetPassword function
import Routes from "@/components/routes";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";

// Zod schema for validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"], // Set the path for the error
  });

export function ResetPasswordForm({
  searchParams,
}: {
  searchParams: { message?: string; code?: string };
}) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize the toast hook
  const router = useRouter();
  /*   const [captchaToken, setCaptchaToken] = useState("");
  const { theme } = useTheme();
 */
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    setError(null); // Reset error before trying again

    try {
      const formData = new FormData();
      formData.append("password", data.password);
      /*     formData.append("captchaToken", captchaToken); */

      await resetPassword(formData, searchParams); // Replace with your API call for resetting the password

      // Reset the form after successful submission
      form.reset();

      // Show success toast notification
      toast({
        title: "Success!",
        description: "Your password has been reset successfully.",
        action: (
          <ToastAction
            altText="Go to login page"
            onClick={() => router.push(Routes.LoginPage)}
          >
            <b>Login</b>
          </ToastAction>
        ),
        duration: Infinity,
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      setError("There was an error resetting your password. Please try again.");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password and confirm it below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Enter new password"
              />
              {form.formState.errors.password && (
                <div className="text-red-500 text-sm">
                  {form.formState.errors.password?.message}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register("confirmPassword")}
                placeholder="Confirm your password"
              />
              {form.formState.errors.confirmPassword && (
                <div className="text-red-500 text-sm">
                  {form.formState.errors.confirmPassword?.message}
                </div>
              )}
            </div>
            {/* <div className="flex justify-center">
              <Turnstile
                siteKey="0x4AAAAAAA-4oeMkEXIOQGB8"
                data-theme={theme === "dark" ? "dark" : "light"}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                }}
              />
            </div> */}
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </div>
        </form>
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
        {searchParams?.message && (
          <div className="text-red-500 text-center mt-4">
            {searchParams.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
