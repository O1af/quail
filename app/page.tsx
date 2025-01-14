"use client";
import { Header } from "@/components/Custom/Landing/header";
import { Hero } from "@/components/Custom/Landing/hero";
import { FeatureCards } from "@/components/Custom/Landing/FeatureCards";
import { Pricing } from "@/components/Custom/Landing/Pricing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <FeatureCards />
        <Pricing />
      </main>
    </div>
  );
}
