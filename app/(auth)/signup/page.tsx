import React from "react";
import { SignUpForm } from "./components/SignUpForm";
import Routes from "@/components/routes";
import { GalleryVerticalEnd } from "lucide-react";

const SignUpPage = () => {
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
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
