import { useTableStore } from "../table_store";
import { SQLData } from "../table_store";
import { ColumnDef } from "@tanstack/react-table";

export const downloadCSV = (customFilename?: string) => {
  const store = useTableStore.getState();
  const { data, columns } = store;

  if (!data.length || !columns.length) return;

  // Create header row
  const headers = columns.map((col) => String(col.header || "")).join(",");

  // Create data rows
  const csvRows = data.map((row) => {
    return columns
      .map((col) => {
        let value: any = "";
        const typedCol = col as ColumnDef<SQLData, any>;

        if (
          "accessorKey" in typedCol &&
          typeof typedCol.accessorKey === "string"
        ) {
          value = row[typedCol.accessorKey];
        } else if ("accessorFn" in typedCol && typedCol.accessorFn) {
          value = typedCol.accessorFn(row, 0);
        }

        // Handle values that might contain commas or quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value === null || value === undefined ? "" : value;
      })
      .join(",");
  });

  // Combine headers and rows
  const csvContent = [headers, ...csvRows].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    customFilename ? `${customFilename}.csv` : "query_results.csv"
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadSelectedCSV = (customFilename?: string) => {
  const store = useTableStore.getState();
  const { data, columns } = store;
  const selectedRows = useTableStore.getState().rowSelection;
  const columnVisibility = useTableStore.getState().columnVisibility;

  // If no rows are selected, select all rows
  const hasSelectedRows = Object.values(selectedRows).some((v) => v);
  const selectedData = hasSelectedRows
    ? data.filter((_, index) => selectedRows[index])
    : data;

  if (!selectedData.length) return;

  // If no columns are visible, show all columns
  const hasVisibleColumns = Object.values(columnVisibility).some((v) => v);
  const visibleColumns = hasVisibleColumns
    ? columns.filter((col) => columnVisibility[col.id as string] !== false)
    : columns;

  if (!visibleColumns.length) return;

  // Create header row
  const headers = visibleColumns
    .map((col) => String(col.header || ""))
    .join(",");

  // Create data rows
  const csvRows = selectedData.map((row) => {
    return visibleColumns
      .map((col) => {
        let value: any = "";
        const typedCol = col as ColumnDef<SQLData, any>;

        if (
          "accessorKey" in typedCol &&
          typeof typedCol.accessorKey === "string"
        ) {
          value = row[typedCol.accessorKey];
        } else if ("accessorFn" in typedCol && typedCol.accessorFn) {
          value = typedCol.accessorFn(row, 0);
        }

        // Handle values that might contain commas or quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value === null || value === undefined ? "" : value;
      })
      .join(",");
  });

  // Combine headers and rows
  const csvContent = [headers, ...csvRows].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    customFilename ? `${customFilename}.csv` : "selected_data.csv"
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
