import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

const exampleMessages = [
  {
    heading: "Write a query to",
    subheading: "join two tables on a common column",
  },
  {
    heading: "What is the syntax for",
    subheading: "grouping records by a specific field?",
  },
  {
    heading: "How can I filter",
    subheading: "records based on a range of dates?",
  },
  {
    heading: "Help me optimize",
    subheading: "this complex query for better performance",
  },
];

export default function ExampleMessages({
  handleInputChange,
}: {
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { resolvedTheme } = useTheme();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="flex-1 w-full px-4 py-12 space-y-8">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center space-y-3"
      >
        <Avatar className="h-16 w-16">
          <AvatarImage
            src="/quail_logo.svg"
            alt="QuailAI"
            className={resolvedTheme === "dark" ? "brightness-0 invert" : ""}
          />
        </Avatar>
        <h2 className="text-2xl font-semibold tracking-tight">Quail AI</h2>
        <p className="text-center text-muted-foreground max-w-md">
          Ask me anything about your database, or try one of the suggestions
          below to get started.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
      >
        {exampleMessages.map((message, index) => (
          <motion.div key={index} variants={item}>
            <Card
              className="p-4 cursor-pointer group transition-all duration-300 ease-out hover:shadow-xl hover:bg-muted/50 border border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60 shadow-sm"
              onClick={() =>
                handleInputChange({
                  target: {
                    value: message.heading + " " + message.subheading,
                  },
                } as any)
              }
            >
              <p className="font-medium text-sm group-hover:text-primary transition-colors duration-300">
                {message.heading}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {message.subheading}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
