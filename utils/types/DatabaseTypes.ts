export interface PostgresRequest {
  connectionString: string;
  query: string;
  sslCA?: string;
  sslCert?: string;
  sslKey?: string;
}

export interface PostgresResponse {
  rowCount: number;
  rows: any[];
}
