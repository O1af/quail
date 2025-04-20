"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import OtpInput from "react-otp-input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import Routes from "@/components/routes";
import Image from "next/image";

export default function ConfirmEmail() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setError("Verification failed. Please check your email and OTP.");
      setLoading(false);
    } else {
      router.push("/login");
    }
  };

  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";

  return (
    <div className="flex min-h-screen items-center justify-center">
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
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Confirm Your Sign Up</CardTitle>
            <CardDescription>
              Enter your email and verification token
            </CardDescription>
          </CardHeader>{" "}
          <CardContent className="space-y-4">
            <div className="pb-4 space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="user@quailbi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Verification Token</Label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                shouldAutoFocus
                containerStyle="flex justify-center gap-4"
                inputStyle="text-3xl text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-hidden"
                renderInput={(props) => <input {...props} />}
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
