import { PostgresResponse } from "../DBQueryTypes";

export interface ChartData {
  chartJsx: string;
  data: PostgresResponse;
  query: string;
}

export interface ChartDocument {
  _id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  data: ChartData;
}
