"use client";
import { Header } from "@/components/Static/Landing/header";
import { Hero } from "@/components/Static/Landing/hero";
import { FeatureCards } from "@/components/Static/Landing/FeatureCards";
import { Pricing } from "@/components/Static/Landing/Pricing";
import { CTA } from "@/components/Static/Landing/CTA";
import { Demo } from "@/components/Static/Landing/Demo";
import FrameworksSection from "@/components/Static/Landing/Frameworks";
import Footer from "@/components/Static/Footer";

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
