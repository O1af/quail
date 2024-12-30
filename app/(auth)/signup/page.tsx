import React from "react";
import { SignUpForm } from "./components/SignUpForm";
import Routes from "@/components/routes";
import Image from "next/image";

const SignUpPage = () => {
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
                src="/BotIcon.png"
                fill
                className="object-contain"
                alt="Avatar"
              />
            </div>
          </div>
          Quail
        </a>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
