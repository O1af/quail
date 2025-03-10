import { Container } from "@/components/ui/container";
import { useState, useCallback, useEffect, memo } from "react";
import { SiSupabase } from "react-icons/si";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

// Use img tags to render SVGs
const NeonLogo = () => {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        src={isDarkTheme ? "/logos/neon-dark.svg" : "/logos/neon-light.svg"}
        alt="Neon Logo"
        className="w-full h-full"
        width={40}
        height={40}
      />
    </div>
  );
};

const PostgresLogo = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        src="/logos/postgres.svg"
        alt="PostgreSQL Logo"
        className="w-full h-full"
        width={40}
        height={40}
      />
    </div>
  );
};

const MySQLLogo = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        src="/logos/mysql.svg"
        alt="PostgreSQL Logo"
        className="w-full h-full"
        width={40}
        height={40}
      />
    </div>
  );
};

const frameworks = [
  {
    name: "PostgreSQL",
    href: "#",
    icon: PostgresLogo,
    color: "#336791",
  },
  {
    name: "MySQL",
    href: "#",
    icon: MySQLLogo,
    color: "#00758F",
  },
  {
    name: "Supabase",
    href: "#",
    icon: SiSupabase,
    color: "#3ECF8E",
  },
  {
    name: "Neon.tech",
    href: "#",
    icon: NeonLogo,
    color: "#00E699",
  },
];

function FrameworksSection() {
  const [hoveredFramework, setHoveredFramework] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [hoveredFramework]);

  const handleMouseEnter = useCallback((name: string) => {
    setHoveredFramework(name);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredFramework(null);
  }, []);

  const displayText = hoveredFramework || "Your Database";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section className="py-12 md:py-24">
      <Container>
        <motion.div
          className="flex flex-col xl:flex-row gap-8 items-center justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div
            className="text-center xl:text-left"
            variants={itemVariants}
          >
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground/90">
              Use Quail With
              <div className="mt-2">
                <div
                  className="inline-block overflow-hidden align-bottom"
                  style={{ height: "1.2em" }}
                >
                  <span
                    className={cn(
                      "inline-block transition-all duration-300 ease-out text-foreground/60",
                      isAnimating
                        ? "translate-y-5 opacity-0"
                        : "translate-y-0 opacity-100"
                    )}
                    style={{
                      color: hoveredFramework
                        ? frameworks.find((f) => f.name === hoveredFramework)
                            ?.color
                        : undefined,
                    }}
                  >
                    {displayText}
                  </span>
                </div>
              </div>
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-4 gap-4 md:grid-cols-4"
            onMouseLeave={handleMouseLeave}
            variants={containerVariants}
          >
            {frameworks.map(({ name, href, icon: Icon, color }) => (
              <motion.a
                key={name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="transition-all duration-300 group"
                onMouseEnter={() => handleMouseEnter(name)}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-lg border bg-background/50 p-3 group-hover:border-primary group-hover:bg-background/80 transition-all duration-300 hover:shadow-lg"
                  style={
                    {
                      "--hover-color": color,
                    } as React.CSSProperties
                  }
                >
                  <Icon
                    className="w-full h-full text-muted-foreground transition-colors duration-300"
                    style={{
                      color: hoveredFramework === name ? color : "currentColor",
                    }}
                  />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

export default memo(FrameworksSection);
