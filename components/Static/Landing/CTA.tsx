import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { motion } from "framer-motion";
import { Shield, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center py-16 md:py-24 bg-background text-foreground overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
            variants={itemVariants}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Trusted by data professionals
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center"
            variants={itemVariants}
          >
            Supercharge Your Analysis With Quail
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Transform your data workflow with{" "}
            <span className="text-emerald-600 font-medium">
              AI-powered SQL generation
            </span>{" "}
            and{" "}
            <span className="text-emerald-600 font-medium">
              instant visualizations
            </span>{" "}
            .
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            variants={itemVariants}
          >
            <Button
              size="lg"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 px-6 font-medium"
              onClick={() => (window.location.href = APP_URL)}
            >
              Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/contact")}
              className="font-medium"
            >
              Schedule a Demo
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
            variants={itemVariants}
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Always Secure
              <Link
                href="/privacy"
                className="text-emerald-500 hover:underline"
              >
                Learn More
              </Link>
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-500" // Added color consistency
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true" // Added for accessibility
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Write SQL like a 10x developer
            </span>
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Visualize in seconds
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
