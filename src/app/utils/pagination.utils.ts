export function buildPagesArray(
  totalCount: number,
  pageSize: number,
  currentPage: number,
): number[] {
  const total = Math.ceil(totalCount / pageSize);
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set(
    [1, total, currentPage, currentPage - 1, currentPage + 1].filter((p) => p >= 1 && p <= total),
  );
  return [...pages].sort((a, b) => a - b);
}

export function totalPages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}

export function goToPage(
  page: number,
  totalPages: number,
  setPage: (p: number) => void,
  load: () => void,
): void {
  if (page < 1 || page > totalPages) return;
  setPage(page);
  load();
}
