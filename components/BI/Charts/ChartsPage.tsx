"use client";

import { useEffect, useState } from "react";
import { listCharts, deleteChart } from "@/components/stores/chart_store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import Routes from "@/components/routes";
import { ChartDocument } from "@/lib/types/stores/chart";

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
import { BarChart3, Trash2, AlertCircle } from "lucide-react";

type AppState = {
  user: any;
  isLoading: boolean;
  isDeleting: boolean;
  error: string | null;
  chartToDelete: string | null;
};

export default function ChartsPage() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [charts, setCharts] = useState<
    Pick<ChartDocument, "_id" | "title" | "updatedAt" | "data">[]
  >([]);
  const [state, setState] = useState<AppState>({
    user: null,
    isLoading: true,
    isDeleting: false,
    error: null,
    chartToDelete: null,
  });

  // Authentication and load charts
  useEffect(() => {
    async function initializeApp() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(Routes.LoginPage);
          return;
        }

        setState((prev) => ({ ...prev, user, isLoading: true }));
        const chartsData = await listCharts(user.id);
        setCharts(chartsData);
        setState((prev) => ({ ...prev, isLoading: false, error: null }));
      } catch (error) {
        console.error("Error:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        }));
      }
    }

    initializeApp();
  }, [router, supabase.auth]);

  // Delete chart handler
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setState((prev) => ({ ...prev, chartToDelete: id }));
  };

  // Delete confirmation handler
  const confirmDelete = async () => {
    const { chartToDelete, user } = state;
    if (!chartToDelete || !user?.id) return;

    try {
      setState((prev) => ({ ...prev, isDeleting: true }));
      await deleteChart(chartToDelete, user.id);

      // Update the charts list
      const updatedCharts = await listCharts(user.id);
      setCharts(updatedCharts);

      setState((prev) => ({
        ...prev,
        isDeleting: false,
        chartToDelete: null,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isDeleting: false,
        error: "Failed to delete chart",
      }));
    }
  };

  const cancelDelete = () =>
    setState((prev) => ({ ...prev, chartToDelete: null }));
  const clearError = () => setState((prev) => ({ ...prev, error: null }));

  if (state.isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Error message */}
      {state.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            {state.error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/*content*/}
      {charts.length === 0 ? (
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
                      {chart.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-70 hover:opacity-100 text-destructive"
                      onClick={(e) => handleDelete(chart._id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardFooter className="pt-1">
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {formatDistanceToNow(new Date(chart.updatedAt), {
                      addSuffix: true,
                    })}
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
              {state.isDeleting ? "Deleting..." : "Delete"}
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
