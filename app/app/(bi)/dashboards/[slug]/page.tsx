"use client";
import React, { useState } from "react";
import { useDashboard } from "./hooks/useDashboard";
import { HeaderControls } from "./components/HeaderControls";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardContent } from "./components/DashboardContent";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { ManageChartsModal } from "./components/ManageChartsModal";
import { ShareDialog } from "./components/ShareDialog";
import { PermissionBadgeDisplay } from "./components/PermissionBadgeDisplay";

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  // Unwrap params promise
  const resolvedParams = React.use(params as Promise<{ slug: string }>);
  const { slug } = resolvedParams;

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

  // Show loading state
  if (isAuthLoading || isLoading) {
    return <LoadingState isAuthLoading={isAuthLoading} />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden pb-4">
      {/* Header controls for title, description, and sharing */}
      <HeaderControls
        dashboard={dashboard}
        isEditing={isEditing}
        tempTitle={tempTitle}
        tempDescription={tempDescription}
        userPermission={userPermission}
        user={user}
        hasUnsavedChanges={hasUnsavedChanges}
        handleTitleChange={handleTitleChange}
        handleDescriptionChange={handleDescriptionChange}
        setIsShareModalOpen={setIsShareModalOpen}
      />

      {/* Dashboard action buttons */}
      <DashboardHeader
        isEditing={isEditing}
        userPermission={userPermission}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        setIsManageChartsOpen={setIsManageChartsOpen}
      />

      {/* Permission badge display - only show when not editing */}
      {userPermission && !isEditing && (
        <div className="px-4 pt-2">
          <PermissionBadgeDisplay
            permission={userPermission}
            userName={user?.user_metadata?.name}
            userEmail={user?.email}
          />
        </div>
      )}

      {/* Main scrollable content area */}
      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <DashboardContent
          dashboard={dashboard}
          chartData={chartData}
          isEditing={isEditing}
          chartUpdateCounter={chartUpdateCounter}
          tempChartsRef={tempChartsRef}
          tempLayoutsRef={tempLayoutsRef}
          setIsManageChartsOpen={setIsManageChartsOpen}
          onLayoutChange={handleLayoutChange}
        />
      </div>

      {/* Modals */}
      {user && dashboard && (
        <>
          <ManageChartsModal
            open={isManageChartsOpen}
            onOpenChange={setIsManageChartsOpen}
            userId={user.id}
            currentCharts={tempChartsRef.current}
            onChartsChange={handleChartsChange}
          />

          <ShareDialog
            open={isShareModalOpen}
            onOpenChange={setIsShareModalOpen}
            dashboard={dashboard}
            onUpdatePermissions={handleUpdatePermissions}
          />
        </>
      )}
    </div>
  );
}
