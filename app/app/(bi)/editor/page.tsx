"use client";
import React, { useEffect } from "react";
import { ResizableDisplay } from "@/components/ResizableDisplay";
import { RunButton } from "@/components/header/run-button";
import { DownloadButton } from "@/components/header/download-button";
import { ClearChat } from "@/components/header/clear-chat";
import { UploadButton } from "@/components/header/upload-button";
import { useHeader } from "@/components/header/header-context";
import { DbHeaderSwitcher } from "@/components/header/db-header-switcher";

export default function Page() {
  const { setHeaderContent, setHeaderButtons } = useHeader();

  useEffect(() => {
    // Set the header content and buttons specific to the editor
    setHeaderContent(
      <div className="flex items-center gap-4">
        <ClearChat />
        <DbHeaderSwitcher />
      </div>
    );

    setHeaderButtons(
      <>
        <UploadButton />
        <DownloadButton />
        <RunButton />
      </>
    );

    // Clean up when component unmounts
    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons]);

  return <ResizableDisplay />;
}
