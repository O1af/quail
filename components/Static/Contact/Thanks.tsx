"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Thanks() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 max-w-md"
      >
        <div className="mb-8 text-green-500">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-muted-foreground mb-8">
          Your message has been successfully sent. We'll get back to you as soon
          as possible.
        </p>
        <Button onClick={() => router.push("/")} className="min-w-[200px]">
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
