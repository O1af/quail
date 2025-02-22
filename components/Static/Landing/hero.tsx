import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { memo } from "react";
import { motion } from "framer-motion";

export const Hero = memo(function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-12 md:py-24">
      <Container className="space-y-16 text-center">
        <motion.div
          className="mx-auto max-w-[800px] space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="secondary" className="mx-auto">
              🚀 Turn Data Into Decisions
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            <span className="bg-gradient-to-r from-green-600 to-green-300 bg-clip-text text-transparent">
              AI Powered Analytics{" "}
            </span>
            <br />
            Simplified
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-[600px] text-lg text-muted-foreground"
          >
            Write queries like you're chatting with an expert, get instant
            visualizations, and make data-driven decisions faster than ever
            before.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              className="mt-8"
              onClick={() => (window.location.href = `${APP_URL}/login`)}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
});
