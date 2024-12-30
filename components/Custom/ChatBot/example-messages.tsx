import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
const exampleMessages = [
  {
    heading: "How do I select",
    subheading: "all records from a table?",
  },
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
];

export default function ExampleMessages({
  handleInputChange,
}: {
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/BotIconDark.png" : "/BotIconLight.png";
  return (
    <div className="flex-1 w-full px-4 py-24 space-y-6">
      <div className="flex items-center justify-center space-x-2">
        <Avatar>
          <AvatarImage src={avatarSrc} alt="QuailAI" />
        </Avatar>
        <span className="text-xl font-semibold">Quail AI</span>
      </div>

      <p className="text-center text-muted-foreground">Ask Quail Anything</p>
      <div className="grid grid-cols-2 gap-3 mt-8">
        {exampleMessages.map((message, index) => (
          <Card
            key={index}
            className="p-4 cursor-pointer transition-colors hover:bg-muted"
            onClick={() =>
              handleInputChange({
                target: {
                  value: message.heading + " " + message.subheading,
                },
              } as any)
            }
          >
            <p className="font-semibold">{message.heading}</p>
            <p className="text-sm text-muted-foreground">
              {message.subheading}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
