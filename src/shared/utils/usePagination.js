import { useState, useEffect } from "react";

// Paginação client-side: fatia uma lista já carregada em páginas.
export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(0);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Mantém a página dentro do intervalo válido quando a lista muda
  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

  const start = page * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { pageItems, page, setPage, totalPages, total };
}
