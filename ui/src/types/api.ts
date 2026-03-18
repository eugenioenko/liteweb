export interface TableObject {
  name: string;
  type: "table" | "view";
}

export interface Column {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  default_value: string | null;
  primary_key: number;
}

export interface Index {
  name: string;
  unique: boolean;
  columns: string[];
}

export interface TableSchema {
  name: string;
  columns: Column[];
  indexes: Index[];
}

export interface TableData {
  columns: string[];
  rows: (string | number | null)[][];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface AuthStatus {
  authenticated: boolean;
  auth_enabled: boolean;
}
