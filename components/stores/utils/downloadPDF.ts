import { useTableStore } from "../table_store";
import { SQLData } from "../table_store";
import { ColumnDef } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadPDF = (customFilename?: string) => {
  const store = useTableStore.getState();
  const { data, columns } = store;
  const columnVisibility = store.columnVisibility;

  if (!data.length) return;

  const visibleColumns = columns.filter(
    (col) => columnVisibility[col.header as string] !== false
  );
  if (!visibleColumns.length) return;

  // Prepare headers and data for PDF
  const headers = visibleColumns.map((col) => String(col.header || ""));
  const tableData = data.map((row) => {
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

      return value === null || value === undefined ? "" : String(value);
    });
  });

  // Create PDF
  const doc = new jsPDF();

  autoTable(doc, {
    head: [headers],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
    margin: { top: 20 },
  });

  // Save the PDF
  doc.save(customFilename ? `${customFilename}.pdf` : "query_results.pdf");
};

export const downloadSelectedPDF = (customFilename?: string) => {
  const store = useTableStore.getState();
  const { data, columns } = store;
  const selectedRows = store.rowSelection;
  const columnVisibility = store.columnVisibility;

  const hasSelectedRows = Object.values(selectedRows).some((v) => v);
  const selectedData = hasSelectedRows
    ? data.filter((_, index) => selectedRows[index])
    : data;

  if (!selectedData.length) return;

  const visibleColumns = columns.filter(
    (col) => columnVisibility[col.header as string] !== false
  );
  if (!visibleColumns.length) return;

  // Prepare headers and data for PDF
  const headers = visibleColumns.map((col) => String(col.header || ""));
  const tableData = selectedData.map((row) => {
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

      return value === null || value === undefined ? "" : String(value);
    });
  });

  // Create PDF
  const doc = new jsPDF();

  autoTable(doc, {
    head: [headers],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
    margin: { top: 20 },
  });

  // Save the PDF
  doc.save(customFilename ? `${customFilename}.pdf` : "selected_data.pdf");
};
