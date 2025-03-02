import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Asterisk,
  Clock,
  LineChart,
  MoreVertical,
  PieChart,
  Pin,
  PinOff,
} from "lucide-react";
import { ChartCardProps } from "../types";

export function ChartCard({
  title,
  type,
  link,
  viewMode,
  pinned,
  onPin,
}: ChartCardProps) {
  console.log(type);
  return viewMode === "grid" ? (
    <Link href={link} className="group">
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {(() => {
              switch (type) {
                case "bar":
                  return <BarChart className="h-4 w-4" />;
                case "line":
                  return <LineChart className="h-4 w-4" />;
                case "pie":
                  return <PieChart className="h-4 w-4" />;
                default:
                  return <Asterisk className="h-4 w-4" />;
              }
            })()}
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                onPin(title);
              }}
              title={pinned ? "Unpin" : "Pin"}
            >
              {pinned ? (
                <Pin className="h-4 w-4 text-yellow-500" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div>{type}</div>
            <div>•</div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated recently</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  ) : (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
      <Link href={link} className="flex-1">
        <div className="flex items-center space-x-3">
          {(() => {
            switch (type) {
              case "bar":
                return <BarChart className="h-4 w-4" />;
              case "line":
                return <LineChart className="h-4 w-4" />;
              case "pie":
                return <PieChart className="h-4 w-4" />;
              default:
                return <Asterisk className="h-4 w-4" />;
            }
          })()}{" "}
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {type} • Updated recently
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onPin(title);
          }}
          title={pinned ? "Unpin" : "Pin"}
        >
          {pinned ? (
            <Pin className="h-4 w-4 text-yellow-500" />
          ) : (
            <PinOff className="h-4 w-4" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
