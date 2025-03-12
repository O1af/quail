"use client";
import dynamic from "next/dynamic";
import { Header } from "@/components/Static/Landing/header";
import { Hero } from "@/components/Static/Landing/hero";

// Fix dynamic imports to use proper types
const FeatureCards = dynamic(
  () =>
    import("@/components/Static/Landing/FeatureCards").then(
      (mod) => mod.default
    ),
  {
    loading: () => <div className="h-[400px] animate-pulse bg-muted/50" />,
  }
);

const FrameworksSection = dynamic(
  () => import("@/components/Static/Landing/Frameworks"),
  {
    loading: () => <div className="h-[300px] animate-pulse bg-muted/50" />,
  }
);

const Demo = dynamic(
  () =>
    import("@/components/Static/Landing/Demo").then((mod) => ({
      default: mod.Demo,
    })),
  {
    loading: () => <div className="h-[400px] animate-pulse bg-muted/50" />,
  }
);

const Pricing = dynamic(
  () =>
    import("@/components/Static/Landing/Pricing").then((mod) => ({
      default: mod.Pricing,
    })),
  {
    loading: () => <div className="h-[400px] animate-pulse bg-muted/50" />,
  }
);

const CTA = dynamic(() =>
  import("@/components/Static/Landing/CTA").then((mod) => ({
    default: mod.CTA,
  }))
);
const Footer = dynamic(() => import("@/components/Static/Footer"));

const Marquee = dynamic(
  () =>
    import("@/components/Static/Landing/Marquee").then((mod) => mod.Marquee),
  {
    loading: () => <div className="h-[400px] animate-pulse bg-muted/50" />,
  }
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1">
        <Hero />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-60 pointer-events-none" />
          <FeatureCards />
        </div>
        <Marquee />
        <FrameworksSection />
        <Demo />
        <div className="relative bg-gradient-to-b from-background to-background/90">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
          <Pricing />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
