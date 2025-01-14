"use client";
import { Header } from "@/components/Custom/Landing/header";
import { Hero } from "@/components/Custom/Landing/hero";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
