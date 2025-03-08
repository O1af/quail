import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import DataVisTable from "../../AgentResult/DataVisTable";
import DataVisQuery from "../../AgentResult/DataVisQuery";
import { Database, Code } from "lucide-react";

type ViewerType = "data" | "query";

interface DataAndQueryViewerProps {
  type: ViewerType;
  data?: PostgresResponse | null;
  query?: string | null;
}

export default function DataAndQueryViewer({
  type,
  data,
  query,
}: DataAndQueryViewerProps) {
  const isDataViewer = type === "data";

  const config = {
    icon: isDataViewer ? (
      <Database className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
    ) : (
      <Code className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
    ),
    title: isDataViewer ? "Chart Data" : "SQL Query",
    description: isDataViewer
      ? "Raw data powering your visualization"
      : "Database query used to generate this chart",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b p-3 flex items-center flex-shrink-0">
        {config.icon}
        <div className="min-w-0 overflow-hidden">
          <h2 className="text-base font-medium leading-tight truncate">
            {config.title}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {config.description}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {isDataViewer ? (
          <DataVisTable data={data || undefined} />
        ) : (
          <div className="p-4 h-full overflow-auto">
            <DataVisQuery query={query || undefined} />
          </div>
        )}
      </div>
    </div>
  );
}
