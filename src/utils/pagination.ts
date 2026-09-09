import { PaginationParams, PaginationMetadata } from '../types/pagination';

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters from query
 * 
 * @param page - Page number from query
 * @param limit - Limit from query
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  page?: string | number,
  limit?: string | number
): PaginationParams {
  const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const validPage = parsedPage && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
  const validLimit = parsedLimit && parsedLimit > 0 && parsedLimit <= MAX_LIMIT
    ? parsedLimit
    : DEFAULT_LIMIT;

  return {
    page: validPage,
    limit: validLimit
  };
}

/**
 * Paginate an array of items
 * 
 * @param items - Array to paginate
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Paginated items
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): T[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
}

/**
 * Calculate pagination metadata
 * 
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export function calculatePaginationMetadata(
  total: number,
  page: number,
  limit: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1
  };
}

/**
 * Create a paginated response
 * 
 * @param items - All items
 * @param page - Page number
 * @param limit - Items per page
 * @returns Paginated items and metadata
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; metadata: PaginationMetadata } {
  const paginatedData = paginateArray(items, page, limit);
  const metadata = calculatePaginationMetadata(items.length, page, limit);
  
  return {
    data: paginatedData,
    metadata
  };
}
