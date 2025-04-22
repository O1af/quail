import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { memo } from "react";
import { ArrowRight, Play } from "lucide-react";
import { Meteors } from "@/components/magicui/meteors";
import {
  AnimatedGradientText,
  type AnimatedGradientTextProps,
} from "@/components/magicui/animated-gradient-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { cn } from "@/lib/utils";

export const Hero = memo(function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36 min-h-[70vh] flex items-center justify-center bg-background">
      <Meteors
        number={3}
        minDelay={1.5}
        maxDelay={4.0}
        minDuration={9.0}
        maxDuration={12.0}
      />

      <Container className="relative z-10">
        <div className="mx-auto max-w-[800px] space-y-8 text-center">
          <div className="flex justify-center">
            <div className="group relative flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_rgba(156,64,255,0.12)] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_rgba(156,64,255,0.25)]">
              <span
                className={cn(
                  "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
                )}
                style={{
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "destination-out",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "subtract",
                  WebkitClipPath: "padding-box",
                }}
              />
              🚀{" "}
              <hr className="mx-2 h-4 w-px shrink-0 bg-neutral-300 dark:bg-neutral-700" />
              <AnimatedGradientText
                className="text-sm font-medium"
                colorFrom="#ffaa40"
                colorTo="#9c40ff"
              >
                Turn Data Into Decisions
              </AnimatedGradientText>
            </div>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15]">
            <span className="bg-linear-to-r from-green-600 via-emerald-500 to-green-400 bg-clip-text text-transparent inline-block pb-1">
              AI Powered Analytics{" "}
            </span>
            <br />
            <span className="relative inline-block mt-1 text-foreground">
              Simplified
            </span>
          </h1>

          <p className="mx-auto max-w-[600px] text-lg md:text-xl text-muted-foreground leading-relaxed">
            Write queries, create visualizations, and make data-driven decisions
            faster than ever before.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <ShimmerButton
              className="shadow-lg"
              shimmerColor="#34d399"
              shimmerSize="0.1em"
              background="linear-gradient(to right, #10b981, #059669)"
              onClick={() => (window.location.href = `${APP_URL}/signup`)}
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-base flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </ShimmerButton>

            <Button
              size="lg"
              variant="outline"
              className="text-base px-6 py-3 border bg-background/50 hover:bg-muted/50 backdrop-blur-sm flex items-center gap-2 transition-colors duration-300"
              onClick={() => (window.location.href = `#demo`)}
            >
              <Play className="h-3.5 w-3.5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
});
