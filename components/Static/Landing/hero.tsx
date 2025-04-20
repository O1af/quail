import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/constants";
import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

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
    <section className="py-20 md:py-28 lg:py-36 relative overflow-hidden">
      {/* Enhanced background elements - made smaller and more subtle */}
      <div className="absolute top-20 right-[10%] w-[30%] h-[30%] bg-linear-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-20 left-[5%] w-[25%] h-[25%] bg-linear-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl -z-10 opacity-50" />

      <Container className="relative">
        <motion.div
          className="mx-auto max-w-[800px] space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-center">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium rounded-full shadow-xs"
            >
              🚀 Turn Data Into Decisions
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center leading-[1.15]"
          >
            <span className="bg-linear-to-r from-green-600 via-emerald-500 to-green-400 bg-clip-text text-transparent inline-block pb-1">
              AI Powered Analytics{" "}
            </span>
            <br />
            <span className="relative inline-block mt-1">Simplified</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-[600px] text-lg md:text-xl text-center text-muted-foreground leading-relaxed"
          >
            Write queries, create visualizations, and make data-driven decisions
            faster than ever before
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <Button
              size="lg"
              className="text-base px-6 py-5 bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 rounded-md shadow-md hover:shadow-lg"
              onClick={() => (window.location.href = `${APP_URL}/signup`)}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-6 py-5 border hover:bg-muted/30 flex items-center gap-2"
              onClick={() => (window.location.href = `#demo`)}
            >
              <Play className="h-3.5 w-3.5" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
});
