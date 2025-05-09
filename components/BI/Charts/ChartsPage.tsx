"use client";

import { useEffect, useState } from "react";
import { listCharts, deleteChart } from "@/components/stores/chart_store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
// Removed createClient import as it's handled by useIsAuthenticated
import Routes from "@/components/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import React Query hooks
import { useIsAuthenticated } from "@/lib/hooks/use-authenticated-query"; // Import only auth hook
import { chartQueryKeys } from "@/lib/hooks/use-chart-data"; // Import query keys from use-chart-data

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart3, Trash2, AlertCircle, Loader2 } from "lucide-react"; // Added Loader2

// Simplified state for deletion dialog
type AppState = {
  isDeleting: boolean;
  chartToDelete: string | null;
};

export default function ChartsPage() {
  const router = useRouter();
  const queryClient = useQueryClient(); // Get query client instance

  // Use authentication hook
  const {
    isAuthenticated,
    isLoading: authIsLoading,
    userId,
  } = useIsAuthenticated();

  // State only for delete confirmation UI
  const [state, setState] = useState<AppState>({
    isDeleting: false,
    chartToDelete: null,
  });

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push(Routes.LoginPage);
    }
  }, [authIsLoading, isAuthenticated, router]);

  // Fetch charts using React Query
  const chartsQuery = useQuery({
    queryKey: chartQueryKeys.list(userId), // Use query key factory
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated"); // Guard against missing userId
      return listCharts(userId);
    },
    enabled: isAuthenticated === true && !!userId, // Enable only when authenticated and userId is available
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  // Mutation for deleting a chart
  const deleteMutation = useMutation({
    mutationFn: async (chartId: string) => {
      if (!userId) throw new Error("User not authenticated");
      return deleteChart(chartId, userId);
    },
    onMutate: () => {
      setState((prev) => ({ ...prev, isDeleting: true })); // Set deleting state for UI feedback
    },
    onSuccess: () => {
      // Invalidate the charts list query to refetch
      queryClient.invalidateQueries({ queryKey: chartQueryKeys.list(userId) });
      setState({ isDeleting: false, chartToDelete: null }); // Reset delete state
    },
    onError: (error) => {
      console.error("Failed to delete chart:", error);
      // Optionally show a toast or keep the dialog open with an error message
      setState((prev) => ({ ...prev, isDeleting: false })); // Reset deleting state on error
      // Consider using a toast notification for the error instead of the Alert component
      // toast({ title: "Error", description: "Failed to delete chart.", variant: "destructive" });
    },
  });

  // Delete chart handler (initiates confirmation)
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setState((prev) => ({ ...prev, chartToDelete: id }));
  };

  // Delete confirmation handler
  const confirmDelete = () => {
    if (!state.chartToDelete) return;
    deleteMutation.mutate(state.chartToDelete);
  };

  const cancelDelete = () =>
    setState((prev) => ({ ...prev, chartToDelete: null, isDeleting: false })); // Also reset isDeleting

  // Combined loading state
  const isLoading = authIsLoading || chartsQuery.isLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Use charts data from the query result
  const charts = chartsQuery.data ?? [];

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Error message from query */}
      {chartsQuery.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Charts</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            {chartsQuery.error.message || "An unknown error occurred"}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => chartsQuery.refetch()} // Add a refetch button
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && charts.length === 0 && !chartsQuery.error ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart) => (
            <Link
              href={`/charts/${chart._id}`}
              key={chart._id}
              className="block group"
            >
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium line-clamp-2 group-hover:text-primary">
                      {chart.title || "Untitled Chart"}{" "}
                      {/* Handle potentially missing title */}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-70 hover:opacity-100 text-destructive flex-shrink-0" // Added flex-shrink-0
                      onClick={(e) => handleDelete(chart._id, e)}
                      disabled={state.isDeleting} // Disable while deleting
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardHeader>
                {/* Removed CardContent as it wasn't used */}
                <CardFooter className="pt-1">
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {chart.updatedAt
                      ? formatDistanceToNow(new Date(chart.updatedAt), {
                          addSuffix: true,
                        })
                      : "never"}{" "}
                    {/* Handle potentially missing updatedAt */}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog
        open={!!state.chartToDelete}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chart</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chart? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={state.isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={state.isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {state.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <Card className="bg-muted/50">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <BarChart3 className="h-20 w-20 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-3">No charts yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t created any charts. Get started by creating your
          first chart using the button in the header.
        </p>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-2/3" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
