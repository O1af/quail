import { useEditorStore } from "../editor_store";

export async function downloadSQL(customFilename?: string) {
  try {
    const query = useEditorStore.getState().value;
    if (!query?.trim()) {
      throw new Error("Query is empty");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = customFilename
      ? `${customFilename.replace(/\.sql$/i, "")}.sql`
      : `query-${timestamp}.sql`;

    const blob = new Blob([query], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    try {
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
    } finally {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Failed to download SQL:", error);
    throw error;
  }
}
