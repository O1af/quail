import React from "react";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { motion } from "framer-motion";

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
      className="flex flex-col items-center justify-center min-h-[400px] bg-background text-foreground p-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <motion.h1
        className="text-4xl font-bold mb-2 text-center"
        variants={itemVariants}
      >
        Transform Your Analysis,{" "}
        <span className="text-primary">Powered by AI</span>
      </motion.h1>

      <motion.div className="flex gap-3 mt-8" variants={itemVariants}>
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
      </motion.div>

      <motion.div
        className="flex items-center gap-8 mt-12 text-sm text-muted-foreground"
        variants={itemVariants}
      >
        <span className="flex items-center gap-2">
          Always Secure{" "}
          <a href="/privacy" className="text-emerald-500 hover:underline">
            Learn More
          </a>
        </span>
      </motion.div>
    </motion.div>
  );
}
