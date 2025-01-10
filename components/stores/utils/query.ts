import { useEditorStore } from "../editor_store";
import { useTableStore } from "../table_store";
import { runPostgres, runMySQL } from "@/utils/actions/runSQL";
import { ColumnDef } from "@tanstack/react-table";
import { SQLData } from "../table_store";
import { useDbStore } from "../db_store";
import { DatabaseStructure, Schema } from "../table_store";

async function getDbConnection() {
  const currentDb = useDbStore.getState().getCurrentDatabase();
  if (!currentDb) {
    throw new Error("No database selected");
  }
  return { connectionString: currentDb.connectionString, type: currentDb.type };
}

export async function executeQuery(
  query: string,
  connectionString?: string,
  dbType?: string
) {
  const dbInfo = connectionString
    ? { connectionString, type: dbType || "postgres" }
    : await getDbConnection();

  try {
    if (dbInfo.type === "mysql") {
      return await runMySQL({
        connectionString: dbInfo.connectionString,
        query: query,
      });
    }
    return await runPostgres({
      connectionString: dbInfo.connectionString,
      query: query,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Error: ${errorMessage}`);
  }
}

export async function testConnection(connectionString: string, type: string) {
  const testQuery = type === "mysql" ? "SELECT 1" : "SELECT 1;";
  await executeQuery(testQuery, connectionString, type);
  return true;
}

export async function handleQuery(): Promise<void> {
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
      })
    );

    setColumns(columns);
    setData(result.rows);
  } else {
    setColumns([]);
    setData([]);
  }
}

interface RawMetadataRow {
  [key: string]: string;
}

function normalizeMetadataRow(row: RawMetadataRow) {
  return {
    table_schema: row.table_schema || row.TABLE_SCHEMA,
    table_name: row.table_name || row.TABLE_NAME,
    table_type: row.table_type || row.TABLE_TYPE,
    column_name: row.column_name || row.COLUMN_NAME,
    data_type: row.data_type || row.DATA_TYPE,
  };
}

export async function queryMetadata(
  connectionString?: string,
  dbType?: string
) {
  const metadataQuery =
    dbType === "mysql"
      ? `SELECT 
    t.TABLE_SCHEMA,
    t.TABLE_NAME,
    t.TABLE_TYPE,
    c.COLUMN_NAME,
    c.DATA_TYPE
FROM information_schema.tables AS t
LEFT JOIN information_schema.columns AS c
    ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
    AND t.TABLE_NAME = c.TABLE_NAME
-- Exclude MySQL-specific system schemas as you see fit:
WHERE t.TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION;`
      : `SELECT 
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

  const result = await executeQuery(metadataQuery, connectionString, dbType);

  const { setDatabaseStructure } = useTableStore.getState();

  if (result.rows.length > 0) {
    const structure: DatabaseStructure = { schemas: [] };
    const schemaMap = new Map<string, Schema>();

    for (const rawRow of result.rows) {
      const row = normalizeMetadataRow(rawRow);
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
