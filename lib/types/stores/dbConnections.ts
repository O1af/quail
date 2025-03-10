export type DbType = "postgres" | "mysql";

export interface DatabaseConfig {
  id: number;
  name: string;
  type: DbType;
  connectionString: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface DbState {
  databases: DatabaseConfig[];
  currentDatabaseId: number | null;
  nextId: number;
  isDatabaseChanged: boolean;
}

export interface ConnectionsDocument {
  _id: string; // userId
  connections: string; // encrypted connections data
  updatedAt: Date;
}
