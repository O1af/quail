import { useTableStore } from "../table_store";
import { SQLData } from "../table_store";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";

export const downloadExcel = (customFilename?: string) => {
  const store = useTableStore.getState();
  const { data, columns } = store;
  const columnVisibility = store.columnVisibility;

  if (!data.length) return;

  // Only include visible columns
  const visibleColumns = columns.filter(
    (col) => col.header && columnVisibility[col.header as string] !== false
  );
  if (!visibleColumns.length) return;

  // Prepare headers
  const headers = visibleColumns.map((col) => String(col.header || ""));

  // Prepare data rows using only visible columns
  const excelData = data.map((row) => {
    return visibleColumns.map((col) => {
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

      return value === null || value === undefined ? "" : value;
    });
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  // Generate Excel file
  XLSX.writeFile(
    wb,
    customFilename ? `${customFilename}.xlsx` : "query_results.xlsx"
  );
};

export const downloadSelectedExcel = (customFilename?: string) => {
  const store = useTableStore.getState();
  const { data, columns } = store;
  const selectedRows = store.rowSelection;
  const columnVisibility = store.columnVisibility;

  const hasSelectedRows = Object.values(selectedRows).some((v) => v);
  const selectedData = hasSelectedRows
    ? data.filter((_, index) => selectedRows[index])
    : data;

  if (!selectedData.length) return;

  // Only include visible columns
  const visibleColumns = columns.filter(
    (col) => col.header && columnVisibility[col.header as string] !== false
  );
  if (!visibleColumns.length) return;

  // Prepare headers
  const headers = visibleColumns.map((col) => String(col.header || ""));

  // Prepare data rows using only visible columns
  const excelData = selectedData.map((row) => {
    return visibleColumns.map((col) => {
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

      return value === null || value === undefined ? "" : value;
    });
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Selected Data");

  // Generate Excel file
  XLSX.writeFile(
    wb,
    customFilename ? `${customFilename}.xlsx` : "selected_data.xlsx"
  );
};
