import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { memo } from "react";

export const Hero = memo(function Hero() {
  return (
    <section className="py-12 md:py-24">
      <Container className="space-y-16 text-center">
        <div className="mx-auto max-w-[800px] space-y-6">
          <Badge variant="secondary" className="mx-auto">
            🚀 AI-Powered Business Insights
          </Badge>
          <h1
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            style={{ contentVisibility: "auto" }}
          >
            <span className="bg-gradient-to-r from-green-600 to-green-300 bg-clip-text text-transparent">
              AI-Driven{" "}
            </span>
            <br />
            Insights, Simplified
          </h1>
          <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
            Quail is the simpler, smarter query tool for anyone. Write SQL
            queries, analyze data, and unlock insights with AI-powered
            assistance.
          </p>
          <Button
            size="lg"
            className="mt-8"
            onClick={() => (window.location.href = `${APP_URL}/login`)}
          >
            Get Started
          </Button>
        </div>
      </Container>
    </section>
  );
});
