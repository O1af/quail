"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import React from "react";
import { FaGoogle } from "react-icons/fa";

const SignInWithGoogleButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center space-x-2"
      onClick={() => {
        signInWithGoogle();
      }}
    >
      <FaGoogle className="ml-2" />
      <span className="flex-1 text-center">Google</span>
    </Button>
  );
};

export default SignInWithGoogleButton;
