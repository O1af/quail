"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  SQLData,
  DatabaseStructure,
} from "@/components/stores/table_store"; // Use 'import type'
import {
  executeQuery,
  executeQueryAndTransform,
  fetchDatabaseStructure,
} from "@/lib/hooks/query-helpers";

// Query keys - organized by feature
export const tableQueryKeys = {
  all: ["table"] as const,
  tableData: () => [...tableQueryKeys.all, "data"] as const,
  databaseStructure: () => [...tableQueryKeys.all, "structure"] as const,
};

// Types for query results
interface TableQueryResult {
  data: SQLData[];
  columns: ColumnDef<SQLData, any>[];
}

/**
 * Hook to execute an SQL query and get the results
 * @param query SQL query string
 * @returns Query result with data, loading and error states
 */
export function useTableData(query: string | null) {
  return useQuery<TableQueryResult>({
    queryKey: [...tableQueryKeys.tableData(), query],
    queryFn: async () => {
      if (!query) return { data: [], columns: [] };
      return executeQueryAndTransform(query);
    },
    enabled: !!query,
    staleTime: Infinity, // Keep data fresh until explicitly invalidated
    refetchOnMount: false, // Don't automatically refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
}

/**
 * Hook to execute a query mutation
 * @returns Mutation object for executing queries
 */
export function useQueryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (query: string) => {
      return await executeQuery(query);
    },
    onSuccess: (result, query) => {
      // Update the query cache with the result
      queryClient.setQueryData([...tableQueryKeys.tableData(), query], () => {
        if (result.rows.length > 0) {
          const columns: ColumnDef<SQLData, any>[] = Object.keys(
            result.rows[0]
          ).map((key) => ({
            accessorKey: key,
            header: key,
            enableSorting: true,
            sortingFn: "basic",
          }));

          return {
            data: result.rows,
            columns: columns,
          };
        } else {
          return { data: [], columns: [] };
        }
      });
    },
  });
}

/**
 * Hook to fetch database structure metadata
 * @returns Query result with the database structure information
 */
export function useDatabaseStructure() {
  return useQuery<DatabaseStructure>({
    queryKey: tableQueryKeys.databaseStructure(),
    queryFn: async () => {
      return await fetchDatabaseStructure();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes - DB structure doesn't change often
  });
}
