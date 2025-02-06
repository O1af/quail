import React from "react";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";

export function CTA() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-2 text-center">
        Transform Your Analysis,{" "}
        <span className="text-primary">Powered by AI</span>
      </h1>

      <div className="flex gap-3 mt-8">
        <Button
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => (window.location.href = APP_URL)}
        >
          Get Started for Free
        </Button>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = "/contact")}
        >
          Contact Us
        </Button>
      </div>

      <div className="flex items-center gap-8 mt-12 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          Always Secure{" "}
          <a href="/privacy" className="text-emerald-500 hover:underline">
            Learn More
          </a>
        </span>
      </div>
    </div>
  );
}
