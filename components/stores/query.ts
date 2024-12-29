import { useEditorStore } from "./editor_store";
import { useTableStore } from "./table_store";
import { runPostgres } from "@/utils/actions/runSQL";
import { ColumnDef } from "@tanstack/react-table";
import { SQLData } from "./table_store";
import { useDbStore } from "./db_store";

export async function handleQuery(): Promise<void> {
  const currentDb = useDbStore.getState().getCurrentDatabase();
  if (!currentDb) {
    throw new Error("No database selected");
  }

  const query = useEditorStore.getState().value;
  const setData = useTableStore.getState().setData;
  const setColumns = useTableStore.getState().setColumns;

  const result = await runPostgres({
    connectionString: currentDb.connectionString,
    query,
  });

  if (result.rows.length > 0) {
    // Create columns based on the first row
    const columns: ColumnDef<SQLData, any>[] = Object.keys(result.rows[0]).map(
      (key) => ({
        accessorKey: key,
        header: key,
        enableSorting: true,
        sortingFn: "basic",
      })
    );

    setColumns(columns);
    setData(result.rows);
  } else {
    // Clear the table if no results
    setColumns([]);
    setData([]);
  }
}
