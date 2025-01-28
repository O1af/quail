"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Success() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const param = searchParams.get("subscription");

  useEffect(() => {
    if (!param) {
      router.push("/");
    } else {
      const timer = setTimeout(() => {
        router.push("http://app.localhost:3000/login/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [param, router]);

  return param ? (
    <div className="flex justify-center items-center h-screen">
      <Card className="p-6 max-w-md text-center bg-muted">
        <CardContent>
          <h1 className="text-2xl font-bold text-green-500">Success!</h1>
          <p className="mt-4">
            You&apos;re subscription plan has been updated to{" "}
            <span className="text-purple-400 font-bold">{param}</span>
          </p>
          <p className="mt-4 text-gray-400">
            You will be redirected shortly. If you aren&apos;t redirected,{" "}
            <Link
              href="http://app.localhost:3000/login/"
              className="text-blue-500"
            >
              click here
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  ) : null;
}
