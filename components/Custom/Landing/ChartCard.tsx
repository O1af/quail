import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Label,
  LabelList,
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
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/BotIconDark.png" : "/BotIconLight.png";
  const fullUserText = "Analyze revenue vs targets YTD 📊";
  const avgRevenue = Math.round(
    finalData.reduce((acc, curr) => acc + curr.total, 0) / finalData.length
  );

  useEffect(() => {
    // Animate user text
    let userIndex = 0;
    const typeText = setInterval(() => {
      if (userIndex < fullUserText.length) {
        setUserText(fullUserText.slice(0, userIndex + 1));
        userIndex++;
      } else {
        clearInterval(typeText);
        // Start showing chart data
        let dataIndex = 0;
        const addData = setInterval(() => {
          if (dataIndex < finalData.length) {
            setData((current) => [...current, finalData[dataIndex]]);
            dataIndex++;
          } else {
            clearInterval(addData);
          }
        }, 300);
      }
    }, 40);

    return () => clearInterval(typeText);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = finalData.find((d) => d.name === label);
      const isAboveGoal = data?.total && data?.total > (data?.goal || 0);
      return (
        <div className="bg-popover/95 p-2 rounded-lg shadow-lg border">
          <p className="font-medium">
            {label} ({data?.quarter})
          </p>
          <p className="text-sm text-muted-foreground">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {isAboveGoal ? "↑" : "↓"} vs Goal: {isAboveGoal ? "+" : ""}
            {((data?.total || 0) - (data?.goal || 0)).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[220px] space-y-4">
      <Card className="border-0 bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="rounded-md bg-card p-3">
                {userText || " "}
                {userText.length < fullUserText.length && (
                  <span className="animate-pulse">|</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card className="border-0 bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc} alt="QuailAI" />
              </Avatar>
              <div className="flex-1">
                <div className="h-[120px] rounded-md bg-card p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        stroke="currentColor"
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        stroke="currentColor"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine
                        y={avgRevenue}
                        stroke="#8884d8"
                        strokeDasharray="3 3"
                      >
                        <Label value="Avg" position="right" fontSize={10} />
                      </ReferenceLine>
                      <Bar
                        dataKey="total"
                        radius={[4, 4, 0, 0]}
                        className="fill-primary"
                        animationDuration={800}
                      >
                        <LabelList
                          dataKey="growth"
                          position="top"
                          fontSize={10}
                          className="fill-muted-foreground"
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
