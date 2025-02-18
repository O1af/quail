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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
        <FrameworksSection />
        <Demo />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
