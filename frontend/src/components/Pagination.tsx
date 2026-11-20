import { Link, useLocation } from "react-router";

interface PaginationProps {
    page: number;
    perPage: number;
    total: number;
}

// Paginação escura (pagination/dark do PHP). A página fica no parâmetro ?page da URL.
export function Pagination({ page, perPage, total }: PaginationProps) {
    const location = useLocation();
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    if (lastPage <= 1) {
        return null;
    }

    function urlFor(target: number): string {
        const params = new URLSearchParams(location.search);

        if (target <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(target));
        }

        const query = params.toString();
        return query ? `${location.pathname}?${query}` : location.pathname;
    }

    const firstItem = (page - 1) * perPage + 1;
    const lastItem = Math.min(page * perPage, total);

    return (
        <nav role="navigation" aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <p className="text-[#678] tabular-nums">
                {firstItem}&ndash;{lastItem} de {total}
            </p>

            <ul className="flex items-center gap-1">
                {/* Anterior */}
                <li>
                    {page <= 1 ? (
                        <span className="px-3 py-1.5 text-[#456] select-none">Anterior</span>
                    ) : (
                        <Link to={urlFor(page - 1)} rel="prev" className="px-3 py-1.5 text-[#9ab] hover:text-white transition-colors">
                            Anterior
                        </Link>
                    )}
                </li>

                {/* Páginas */}
                {Array.from({ length: lastPage }, (_, index) => index + 1).map((number) => (
                    <li key={number}>
                        {number === page ? (
                            <span
                                aria-current="page"
                                className="px-3 py-1.5 rounded-[3px] bg-[#53c7ff] text-[#14181c] font-bold tabular-nums"
                            >
                                {number}
                            </span>
                        ) : (
                            <Link
                                to={urlFor(number)}
                                className="px-3 py-1.5 rounded-[3px] bg-[#2c3440] text-[#9ab] hover:bg-[#456] hover:text-white transition-colors tabular-nums"
                            >
                                {number}
                            </Link>
                        )}
                    </li>
                ))}

                {/* Próxima */}
                <li>
                    {page < lastPage ? (
                        <Link to={urlFor(page + 1)} rel="next" className="px-3 py-1.5 text-[#9ab] hover:text-white transition-colors">
                            Próxima
                        </Link>
                    ) : (
                        <span className="px-3 py-1.5 text-[#456] select-none">Próxima</span>
                    )}
                </li>
            </ul>
        </nav>
    );
}

// Recorta a lista para a página atual (a API devolve tudo de uma vez).
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
    return items.slice((page - 1) * perPage, page * perPage);
}

export function pageFrom(search: URLSearchParams): number {
    const page = Number(search.get("page"));
    return Number.isInteger(page) && page > 0 ? page : 1;
}
