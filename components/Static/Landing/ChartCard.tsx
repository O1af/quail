import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

const finalData = [
  { name: "Jan", total: 1200, growth: "+12%", quarter: "Q1", goal: 1000 },
  { name: "Feb", total: 2100, growth: "+75%", quarter: "Q1", goal: 2000 },
  { name: "Mar", total: 1800, growth: "-14%", quarter: "Q1", goal: 2000 },
  { name: "Apr", total: 2400, growth: "+33%", quarter: "Q2", goal: 2200 },
  { name: "May", total: 1700, growth: "-29%", quarter: "Q2", goal: 2200 },
  { name: "Jun", total: 3100, growth: "+82%", quarter: "Q2", goal: 2500 },
];

export function ChartCard() {
  const [data, setData] = useState<typeof finalData>([]);
  const [userText, setUserText] = useState("");
  const [isUserTypingDone, setIsUserTypingDone] = useState(false);
  const { resolvedTheme } = useTheme();
  const fullUserText = "Analyze revenue vs targets YTD 📊";

  useEffect(() => {
    let userIndex = 0;
    let dataTimer: NodeJS.Timeout | null = null;
    let dataIndex = 0;

    const typeText = setInterval(() => {
      if (userIndex < fullUserText.length) {
        setUserText(fullUserText.slice(0, userIndex + 1));
        userIndex++;
      } else {
        clearInterval(typeText);
        setIsUserTypingDone(true);
        setTimeout(() => {
          dataTimer = setInterval(() => {
            if (dataIndex < finalData.length) {
              setData((current) => [...current, finalData[dataIndex]]);
              dataIndex++;
            } else {
              if (dataTimer) clearInterval(dataTimer);
            }
          }, 250);
        }, 500);
      }
    }, 40);

    return () => {
      clearInterval(typeText);
      if (dataTimer) clearInterval(dataTimer);
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = finalData.find((d) => d.name === label);
      return (
        <div className="bg-popover/95 p-2 rounded-lg shadow-lg border text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/20">U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="rounded-md bg-muted/60 p-3 text-sm">
            {userText || " "}
            {userText.length < fullUserText.length && (
              <span className="animate-pulse">|</span>
            )}
          </div>
        </div>
      </div>

      {isUserTypingDone && (
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src="/quail_logo.svg"
              alt="QuailAI"
              className={resolvedTheme === "dark" ? "brightness-0 invert" : ""}
            />
          </Avatar>
          <div className="flex-1">
            <div className="h-[120px] rounded-md bg-muted/60 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 5, right: 0, left: -25, bottom: -10 }}
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="currentColor"
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    stroke="currentColor"
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[2, 2, 0, 0]}
                    fill="url(#chartGradient)"
                    animationDuration={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
