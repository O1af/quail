"use client";

import { useDbStore } from "../stores/db_store";
import { DatabaseCard } from "./DatabaseCard";
import { DatabaseDialog } from "./DatabaseDialog";
import { useEffect, useState } from "react";

export function DatabasesForm() {
  const {
    databases,
    addDatabase,
    removeDatabase,
    updateDatabase,
    currentDatabaseId,
  } = useDbStore();
  const [sortActive, setSortActive] = useState(true);

  useEffect(() => {
    // When component first mounts, sort them
    setSortActive(true);
  }, []);

  const sortedDatabases = sortActive
    ? [
        ...databases.filter((db) => db.id === currentDatabaseId),
        ...databases.filter((db) => db.id !== currentDatabaseId),
      ]
    : databases;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Database Connections</h2>
        <DatabaseDialog onSubmit={addDatabase} />
      </div>
      <div className="grid gap-4">
        {sortedDatabases.map((db) => (
          <DatabaseCard
            key={db.id}
            db={db}
            onEdit={updateDatabase}
            onDelete={removeDatabase}
          />
        ))}
      </div>
    </div>
  );
}
