export type Paginado<T> = {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
};

export function parsePaginacao(
  searchParams: URLSearchParams,
  porPaginaPadrao = 15,
  maximoPorPagina = 100,
) {
  const porPagina = Math.min(
    maximoPorPagina,
    Math.max(1, Number(searchParams.get("perPage")) || porPaginaPadrao),
  );
  const pagina = Math.max(1, Number(searchParams.get("page")) || 1);
  return { pagina, porPagina, skip: (pagina - 1) * porPagina };
}

export function paginado<T>(
  itens: T[],
  total: number,
  pagina: number,
  porPagina: number,
): Paginado<T> {
  return {
    itens,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    porPagina,
  };
}