export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
}

export type ApiResponse<T> =
  | { success: true;  data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string } };

export function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}
