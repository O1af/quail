import { useEditorStore } from "../editor_store";
import { useTableStore } from "../table_store";
import { runPostgres, runMySQL } from "@/utils/actions/runSQL";
import { ColumnDef } from "@tanstack/react-table";
import { SQLData } from "../table_store";
import { useQueryClient } from "@tanstack/react-query";
import { dbQueryKeys } from "@/lib/hooks/use-database";
import { DbState } from "@/lib/types/stores/dbConnections";
import { DatabaseStructure, Schema, Column, Index } from "../table_store";
import { mysqlMeta, pgMeta } from "./metadataQueries";

import { getCurrentDatabaseConnection } from "@/lib/actions/database-connection";

async function getDbConnection() {
  try {
    return await getCurrentDatabaseConnection();
  } catch (error) {
    console.error("Error getting DB connection:", error);
    throw error;
  }
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
    ordinal_position: row.ordinal_position || row.ORDINAL_POSITION,
    character_maximum_length:
      row.character_maximum_length || row.CHARACTER_MAXIMUM_LENGTH,
    numeric_precision: row.numeric_precision || row.NUMERIC_PRECISION,
    column_default: row.column_default || row.COLUMN_DEFAULT,
    is_nullable: row.is_nullable || row.IS_NULLABLE,
    is_identity: row.is_identity || row.IS_IDENTITY,
    identity_generation: row.identity_generation || row.IDENTITY_GENERATION,
    extra: row.extra || row.EXTRA,
    column_comment: row.column_comment || row.COLUMN_COMMENT,
    is_primary: row.is_primary || row.IS_PRIMARY,
    is_unique: row.is_unique || row.IS_UNIQUE,
    is_foreign_key: row.is_foreign_key || row.IS_FOREIGN_KEY,
    referenced_table: row.referenced_table || row.REFERENCED_TABLE,
    referenced_column: row.referenced_column || row.REFERENCED_COLUMN,
    table_comment: row.table_comment || row.TABLE_COMMENT,
    indexes: Array.isArray(row.indexes)
      ? row.indexes
      : typeof row.indexes === "string"
      ? row.indexes.split(", ").filter(Boolean)
      : [],
    check_constraints: Array.isArray(row.check_constraints)
      ? row.check_constraints
      : typeof row.check_constraints === "string"
      ? row.check_constraints.split("; ").filter(Boolean)
      : [],
  };
}

function processMetadataRow(
  row: RawMetadataRow,
  schemaMap: Map<string, Schema>
) {
  const normalizedRow = normalizeMetadataRow(row);
  const schemaName = normalizedRow.table_schema;
  const tableName = normalizedRow.table_name;

  // Get or create schema
  if (!schemaMap.has(schemaName)) {
    schemaMap.set(schemaName, { name: schemaName, tables: [] });
  }
  const schema = schemaMap.get(schemaName)!;

  // Get or create table metadata
  let tableMetadata = schema.tables.find((t) => t.name === tableName);
  if (!tableMetadata) {
    tableMetadata = {
      name: tableName,
      type: normalizedRow.table_type,
      comment: normalizedRow.table_comment,
      columns: [],
      indexes: [],
    };
    schema.tables.push(tableMetadata);
  }

  // Process column information
  if (normalizedRow.column_name) {
    const column: Column = {
      name: normalizedRow.column_name,
      dataType: normalizedRow.data_type,
      ordinalPosition: parseInt(normalizedRow.ordinal_position) || undefined,
      characterMaximumLength:
        parseInt(normalizedRow.character_maximum_length) || undefined,
      numericPrecision: parseInt(normalizedRow.numeric_precision) || undefined,
      columnDefault: normalizedRow.column_default,
      isNullable: normalizedRow.is_nullable,
      isIdentity:
        normalizedRow.is_identity === "1" ||
        normalizedRow.is_identity === "true",
      identityGeneration: normalizedRow.identity_generation,
      extra: normalizedRow.extra,
      columnComment: normalizedRow.column_comment,
      isPrimary:
        normalizedRow.is_primary === "1" || normalizedRow.is_primary === "true",
      isUnique:
        normalizedRow.is_unique === "1" || normalizedRow.is_unique === "true",
      isForeignKey:
        normalizedRow.is_foreign_key === "1" ||
        normalizedRow.is_foreign_key === "true",
      referencedTable: normalizedRow.referenced_table,
      referencedColumn: normalizedRow.referenced_column,
    };

    // Only add if column doesn't exist
    if (!tableMetadata.columns.some((c) => c.name === column.name)) {
      tableMetadata.columns.push(column);
    }

    // Handle indexes
    if (normalizedRow.indexes && normalizedRow.indexes.length > 0) {
      for (const indexName of normalizedRow.indexes) {
        let index = tableMetadata.indexes.find((i) => i.name === indexName);
        if (!index) {
          index = {
            name: indexName,
            columns: [normalizedRow.column_name],
            isUnique:
              indexName.toLowerCase().includes("_unique") || column.isUnique,
            isPrimary:
              indexName.toLowerCase().includes("_pkey") || column.isPrimary,
          };
          tableMetadata.indexes.push(index);
        } else if (!index.columns.includes(normalizedRow.column_name)) {
          index.columns.push(normalizedRow.column_name);
        }
      }
    }

    // Handle primary key if not already covered by indexes
    if (column.isPrimary && !tableMetadata.indexes.some((i) => i.isPrimary)) {
      tableMetadata.indexes.push({
        name: `${tableName}_pkey`,
        columns: [column.name],
        isUnique: true,
        isPrimary: true,
      });
    }

    // Handle standalone unique constraints if not already covered by indexes
    if (
      column.isUnique &&
      !column.isPrimary &&
      !tableMetadata.indexes.some(
        (i) =>
          i.isUnique && i.columns.length === 1 && i.columns[0] === column.name
      )
    ) {
      tableMetadata.indexes.push({
        name: `${tableName}_${column.name}_unique`,
        columns: [column.name],
        isUnique: true,
        isPrimary: false,
      });
    }
  }
}

export async function queryMetadata(
  connectionString?: string,
  dbType?: string
) {
  const metadataQuery = dbType === "mysql" ? mysqlMeta : pgMeta;

  const { setDatabaseStructure } = useTableStore.getState();

  try {
    const result = await executeQuery(metadataQuery, connectionString, dbType);

    if (result.rows.length > 0) {
      const schemaMap = new Map<string, Schema>();

      // Process each row into the schema map
      for (const row of result.rows) {
        processMetadataRow(row, schemaMap);
      }

      // Convert the map to the final structure
      const structure: DatabaseStructure = {
        schemas: Array.from(schemaMap.values()),
      };

      setDatabaseStructure(structure);
    } else {
      setDatabaseStructure({ schemas: [] });
    }
  } catch (error) {
    setDatabaseStructure({ schemas: [] });
    throw error; // Re-throw for the UI to handle
  }
}
