export interface PostgresRequest {
  connectionString: string;
  query: string;
  sslCA?: string;
  sslCert?: string;
  sslKey?: string;
}

export interface ColumnType {
  colName: string;
  colType: number;
  jsType: string;
}

export interface PostgresResponse {
  rowCount: number;
  rows: any[];
  error?: string;
  types: ColumnType[];
}

export interface MySQLRequest {
  connectionString: string;
  query: string;
  sslCA?: string;
  sslCert?: string;
  sslKey?: string;
}
