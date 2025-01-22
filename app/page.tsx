"use client";
import { Header } from "@/components/Custom/Static/Landing/header";
import { Hero } from "@/components/Custom/Static/Landing/hero";
import { FeatureCards } from "@/components/Custom/Static/Landing/FeatureCards";
import { Pricing } from "@/components/Custom/Static/Landing/Pricing";
import { CTA } from "@/components/Custom/Static/Landing/CTA";
import Footer from "@/components/Custom/Static/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
