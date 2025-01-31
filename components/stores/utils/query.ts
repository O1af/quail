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

  const response =
    dbInfo.type === "mysql"
      ? await runMySQL({
          connectionString: dbInfo.connectionString,
          query: query,
        })
      : await runPostgres({
          connectionString: dbInfo.connectionString,
          query: query,
        });

  if (response.error) {
    throw new Error(response.error);
  }

  return response;
}

export async function testConnection(connectionString: string, type: string) {
  const testQuery = type === "mysql" ? "SELECT 1" : "SELECT 1;";
  await executeQuery(testQuery, connectionString, type);
  return true;
}

export async function handleQuery(queryString?: string): Promise<void> {
  const query = queryString ?? useEditorStore.getState().value;
  const { setData, setColumns } = useTableStore.getState();

  try {
    const result = await executeQuery(query);

    if (result.rows.length > 0) {
      const columns: ColumnDef<SQLData, any>[] = Object.keys(
        result.rows[0]
      ).map((key) => ({
        accessorKey: key,
        header: key,
        enableSorting: true,
        sortingFn: "basic",
      }));

      setColumns(columns);
      setData(result.rows);
    } else {
      setColumns([]);
      setData([]);
    }
  } catch (error) {
    setColumns([]);
    setData([]);
    throw error; // Re-throw for the UI to handle
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
    index_name: row.index_name || row.INDEX_NAME,
    is_unique: row.is_unique || row.IS_UNIQUE,
    is_primary: row.is_primary || row.IS_PRIMARY,
    index_column: row.index_column || row.INDEX_COLUMN,
  };
}

export async function queryMetadata(connectionString?: string, dbType?: string) {
  const metadataQuery = dbType === "mysql"
    ? `SELECT 
        t.TABLE_SCHEMA,
        t.TABLE_NAME,
        t.TABLE_TYPE,
        c.COLUMN_NAME,
        c.DATA_TYPE,
        i.INDEX_NAME,
        i.NON_UNIQUE = 0 as IS_UNIQUE,
        i.INDEX_NAME = 'PRIMARY' as IS_PRIMARY,
        ic.COLUMN_NAME as INDEX_COLUMN
      FROM information_schema.tables AS t
      LEFT JOIN information_schema.columns AS c
        ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
      LEFT JOIN information_schema.statistics AS i
        ON t.TABLE_SCHEMA = i.TABLE_SCHEMA AND t.TABLE_NAME = i.TABLE_NAME
      LEFT JOIN information_schema.statistics AS ic
        ON i.INDEX_NAME = ic.INDEX_NAME AND i.TABLE_SCHEMA = ic.TABLE_SCHEMA AND i.TABLE_NAME = ic.TABLE_NAME
      WHERE t.TABLE_SCHEMA NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
      ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION;`
    : `SELECT 
        t.table_schema,
        t.table_name,
        t.table_type,
        c.column_name,
        c.data_type,
        i.indexname as index_name,
        i.indexdef LIKE '%UNIQUE%' as is_unique,
        i.indexdef LIKE '%PRIMARY%' as is_primary,
        ic.column_name as index_column
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      LEFT JOIN pg_indexes i
        ON t.table_schema = i.schemaname AND t.table_name = i.tablename
      LEFT JOIN (
        SELECT 
          a.attname as column_name,
          i.relname as index_name,
          n.nspname as schema_name,
          t.relname as table_name
        FROM pg_class t
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      ) ic ON ic.schema_name = t.table_schema 
        AND ic.table_name = t.table_name 
        AND ic.index_name = i.indexname
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY t.table_schema, t.table_name, c.ordinal_position;`;

  const { setDatabaseStructure } = useTableStore.getState();

  try {
    const result = await executeQuery(metadataQuery, connectionString, dbType);

    if (result.rows.length > 0) {
      const structure: DatabaseStructure = { schemas: [] };
      const schemaMap = new Map<string, Schema>();

      // First pass: Create tables and columns
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
          table = { name: tableName, type: tableType, columns: [], indexes: [] };
          schema.tables.push(table);
        }

        if (columnName && !table.columns.some(c => c.name === columnName)) {
          table.columns.push({ name: columnName, dataType });
        }

        // Handle indexes
        if (row.index_name && row.index_column) {
          let index = table.indexes.find(i => i.name === row.index_name);
          if (!index) {
            index = {
              name: row.index_name,
              columns: [],
              isUnique: Boolean(row.is_unique),
              isPrimary: Boolean(row.is_primary)
            };
            table.indexes.push(index);
          }
          if (!index.columns.includes(row.index_column)) {
            index.columns.push(row.index_column);
          }
        }
      }

      structure.schemas = Array.from(schemaMap.values());
      setDatabaseStructure(structure);
    } else {
      setDatabaseStructure({ schemas: [] });
    }
  } catch (error) {
    setDatabaseStructure({ schemas: [] });
    throw error; // Re-throw for the UI to handle
  }
}
