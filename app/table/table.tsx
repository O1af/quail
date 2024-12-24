import React from "react";
import { Payment, columns } from "./columns";
import { DataTable } from "@/components/data-table";

export default function Table() {
  // Hardcoded data
  const data: Payment[] = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 125,
      status: "pending",
      email: "ritij@example.com",
    },
    // Add more rows as needed
  ];

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
