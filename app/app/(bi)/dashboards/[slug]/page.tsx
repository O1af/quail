"use client";
import React, { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useDashboard } from "./hooks/useDashboard";
import { HeaderControls } from "./components/HeaderControls";
import { DashboardContent } from "./components/DashboardContent";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { ManageChartsModal } from "./components/ManageChartsModal";
import { ShareDialog } from "./components/ShareDialog";
import { PermissionBadgeDisplay } from "./components/PermissionBadgeDisplay";

export default function Page() {
  const params = useParams<{ slug: string }>();
  const { slug } = params;

  // Modal states
  const [isManageChartsOpen, setIsManageChartsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Use our custom hook for dashboard functionality
  const {
    user,
    dashboard,
    isLoading,
    isAuthLoading,
    isSaving,
    error,
    chartData,
    userPermission,
    tempTitle,
    tempDescription,
    isEditing,
    hasUnsavedChanges,
    chartUpdateCounter,
    tempLayoutsRef,
    tempChartsRef,
    handleTitleChange,
    handleDescriptionChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleLayoutChange,
    handleChartsChange,
    handleUpdatePermissions,
  } = useDashboard(slug);

  const handleChartDataUpdate = useCallback(
    (chartId: string, updates: any) => {},
    []
  );

  // Show loading state
  if (isAuthLoading || isLoading) {
    return <LoadingState isAuthLoading={isAuthLoading} />;
  }

  // Show error state - pass error message
  if (error) {
    // Use error.message as ErrorState likely expects a string
    return <ErrorState error={error.message} />;
  }

  // Ensure dashboard is defined before rendering components that require it
  if (!dashboard) {
    // This case might indicate an issue if loading is false and error is null but dashboard is still undefined.
    return <div>Dashboard data is not available.</div>; // Or a more specific loading/empty state
  }

  // Add check for user as well. Logically, if dashboard is loaded, user should exist.
  // This satisfies TypeScript's check for passing user.id.
  if (!user) {
    // This state should ideally not be reached if the logic holds, but handles the type error.
    return <div>User data not available.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header controls with all header buttons - pass dashboard or null */}
      <HeaderControls
        dashboard={dashboard ?? null}
        isEditing={isEditing}
        tempTitle={tempTitle}
        tempDescription={tempDescription}
        userPermission={userPermission}
        user={user} // user is guaranteed non-null here
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        handleTitleChange={handleTitleChange}
        handleDescriptionChange={handleDescriptionChange}
        setIsShareModalOpen={setIsShareModalOpen}
        setIsManageChartsOpen={setIsManageChartsOpen}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleCancel={handleCancel}
      />

      {/* Permission badge display - only show when not editing */}
      {userPermission && !isEditing && (
        <div className="px-4">
          <PermissionBadgeDisplay
            permission={userPermission}
            userName={user.user_metadata?.name} // user is non-null
            userEmail={user.email} // user is non-null
          />
        </div>
      )}

      {/* Main scrollable content area - pass dashboard or null */}
      <div className="grow overflow-y-auto p-4 pt-0">
        <DashboardContent
          dashboard={dashboard} // dashboard is guaranteed non-null here
          chartData={chartData}
          isEditing={isEditing}
          chartUpdateCounter={chartUpdateCounter}
          tempChartsRef={tempChartsRef}
          tempLayoutsRef={tempLayoutsRef}
          setIsManageChartsOpen={setIsManageChartsOpen}
          onLayoutChange={handleLayoutChange}
          // user is guaranteed non-null here, so user.id is safe
          userId={user.id}
          onChartDataUpdate={handleChartDataUpdate}
        />
      </div>

      {/* Modals - Check for user and dashboard ensures user.id is safe */}
      {/* The outer checks already guarantee user and dashboard are non-null here */}
      <>
        <ManageChartsModal
          open={isManageChartsOpen}
          onOpenChange={setIsManageChartsOpen}
          userId={user.id} // user is guaranteed here
          currentCharts={tempChartsRef.current}
          onChartsChange={handleChartsChange}
        />

        <ShareDialog
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          dashboard={dashboard} // dashboard is guaranteed here
          onUpdatePermissions={handleUpdatePermissions}
        />
      </>
    </div>
  );
}
