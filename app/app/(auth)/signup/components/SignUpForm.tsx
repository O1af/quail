"use client";
import { useRef, useState } from "react";
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
import { useToast } from "@/hooks/use-toast"; // Import the toast hook
import { useTheme } from "next-themes";

import { signup } from "@/lib/auth-actions";
import Routes from "@/components/routes";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// Zod schema for validation
const formSchema = z.object({
  "first-name": z.string().min(1, { message: "First name is required." }),
  "last-name": z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, {
    message: "Password must contain at least 6 characters.",
  }),
});

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize the toast hook
  const [captchaToken, setCaptchaToken] = useState("");
  const captcha = useRef<HCaptcha | null>(null);
  const { theme } = useTheme();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      "first-name": "",
      "last-name": "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: {
    "first-name": string;
    "last-name": string;
    email: string;
    password: string;
  }) => {
    setError(null); // Reset the error before submission

    try {
      // Call signup with the data directly
      const formData = new FormData();
      formData.append("first-name", data["first-name"]);
      formData.append("last-name", data["last-name"]);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("captchaToken", captchaToken);

      await signup(formData);
      toast({
        title: "Email Verification Sent!",
        description:
          "If no account is associated with this email, a verification email will still be sent to you.",
        duration: Infinity,
        variant: "success",
      });

      captcha.current?.resetCaptcha();

      form.reset();
    } catch (err) {
      // console.log(err);
      setError("There was an error creating your account. Please try again.");
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  {...form.register("first-name")}
                  placeholder="John"
                />
                {form.formState.errors["first-name"] && (
                  <div className="text-red-500 text-sm">
                    {form.formState.errors["first-name"]?.message}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  {...form.register("last-name")}
                  placeholder="Doe"
                />
                {form.formState.errors["last-name"] && (
                  <div className="text-red-500 text-sm">
                    {form.formState.errors["last-name"]?.message}
                  </div>
                )}
              </div>
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <div className="text-red-500 text-sm">
                  {form.formState.errors.password?.message}
                </div>
              )}
            </div>
            {/* HCaptcha Component */}
            <div className="flex justify-center">
              <HCaptcha
                ref={captcha}
                sitekey="9b8404d2-3b54-4eca-afc8-300cfd546c2a"
                onVerify={setCaptchaToken}
                theme={theme === "dark" ? "dark" : "light"}
              />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
        </form>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href={Routes.LoginPage} className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
