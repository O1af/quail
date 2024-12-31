import { useEditorStore } from "./editor_store";
import { useTableStore } from "./table_store";
import { runPostgres } from "@/utils/actions/runSQL";
import { ColumnDef } from "@tanstack/react-table";
import { SQLData } from "./table_store";
import { useDbStore } from "./db_store";
import { DatabaseStructure, Schema } from "./table_store";
import { createClient } from "@/utils/supabase/server";

async function checkAuth() {
  const supabase = createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }
}

async function getDbConnection() {
  const currentDb = useDbStore.getState().getCurrentDatabase();
  if (!currentDb) {
    throw new Error("No database selected");
  }
  return currentDb.connectionString;
}

export async function executeQuery(query: string, connectionString?: string) {
  await checkAuth();
  const dbConnection = connectionString || (await getDbConnection());
  try {
    return await runPostgres({ connectionString: dbConnection, query: query });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Error: ${errorMessage}`);
  }
}

export async function testConnection(connectionString: string, type: string) {
  await checkAuth();
  const testQuery = type === "mysql" ? "SELECT 1" : "SELECT 1;";
  await executeQuery(testQuery, connectionString);
  return true;
}

export async function handleQuery(): Promise<void> {
  await checkAuth();
  const query = useEditorStore.getState().value;
  const { setData, setColumns } = useTableStore.getState();

  const result = await executeQuery(query);

  if (result.rows.length > 0) {
    const columns: ColumnDef<SQLData, any>[] = Object.keys(result.rows[0]).map(
      (key) => ({
        accessorKey: key,
        header: key,
        enableSorting: true,
        sortingFn: "basic",
      }),
    );

    setColumns(columns);
    setData(result.rows);
  } else {
    setColumns([]);
    setData([]);
  }
}

export async function queryMetadata(
  connectionString?: string,
  dbType?: string,
) {
  await checkAuth();
  const metadataQuery = `SELECT 
    t.table_schema,
    t.table_name,
    t.table_type,
    c.column_name,
    c.data_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY t.table_schema, t.table_name, c.ordinal_position;`;

  const result = await executeQuery(metadataQuery, connectionString);

  const { setDatabaseStructure } = useTableStore.getState();

  if (result.rows.length > 0) {
    const structure: DatabaseStructure = { schemas: [] };
    const schemaMap = new Map<string, Schema>();

    for (const row of result.rows) {
      const schemaName = row.table_schema;
      const tableName = row.table_name;
      const tableType = row.table_type;
      const columnName = row.column_name;
      const dataType = row.data_type;

      if (!schemaMap.has(schemaName)) {
        schemaMap.set(schemaName, { name: schemaName, tables: [] });
      }

      const schema = schemaMap.get(schemaName)!;
      let table = schema.tables.find((t) => t.name === tableName);

      if (!table) {
        table = { name: tableName, type: tableType, columns: [] };
        schema.tables.push(table);
      }

      if (columnName) {
        table.columns.push({ name: columnName, dataType });
      }
    }
    structure.schemas = Array.from(schemaMap.values());
    setDatabaseStructure(structure);
  } else {
    setDatabaseStructure({ schemas: [] });
  }
}
