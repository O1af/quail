"use client";

import { useDbStore } from "../stores/db_store";
import { DatabaseCard } from "./DatabaseCard";
import { DatabaseFormPopover } from "./DatabaseFormPopover";

export function DatabasesForm() {
  const { databases, addDatabase, removeDatabase, updateDatabase } =
    useDbStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Database Connections</h2>
        <DatabaseFormPopover onSubmit={addDatabase} />
      </div>

      <div className="grid gap-4">
        {databases.map((db) => (
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
