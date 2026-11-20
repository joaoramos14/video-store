import { Link, useSearchParams } from "react-router";
import { genresApi, moviesApi } from "../../api";
import { errorMessage } from "../../api/client";
import type { Genre } from "../../api/types";
import { LoadError, Loading } from "../../components/PageState";
import { Pagination, pageFrom, paginate } from "../../components/Pagination";
import { deleteAction, editAction, emptyLink, panel, tableHead, tableRow } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { useLoad } from "../../hooks/useLoad";
import { plural } from "../../utils/format";
import { InactiveBadge, ListHeader } from "./AdminPage";
import { useTitle } from "../../hooks/useTitle";

const PER_PAGE = 10;

export function Genres() {
    useTitle("Gêneros");
    const [search] = useSearchParams();
    const page = pageFrom(search);
    const flash = useFlash();

    const { data, error, loading } = useLoad(() => Promise.all([genresApi.list(), moviesApi.list()]));

    async function remove(genre: Genre) {
        if (!window.confirm("Tem certeza que deseja excluir este gênero?")) return;

        try {
            await genresApi.remove(genre.id);
            flash.status("Gênero excluído com sucesso!", "/admin/genres");
        } catch (exception) {
            flash.error(errorMessage(exception));
        }
    }

    const [genres, movies] = data ?? [[], []];
    const sorted = [...genres].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    function movieCount(genreId: string): number {
        return movies.filter((movie) => movie.genre_id === genreId).length;
    }

    return (
        <div>
            {/* Cabeçalho da página */}
            <ListHeader
                title="Gêneros"
                description="Gêneros usados para organizar o catálogo."
                newLabel="Novo gênero"
                newTo="/admin/genres/new"
            />

            {/* Título de seção */}
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9ab] border-b border-[#456] pb-1 mb-0">
                Todos os gêneros
            </h2>

            {/* Lista */}
            <div className={`${panel} overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={tableHead}>
                            <th className="py-3 px-4 font-semibold">Nome</th>
                            <th className="py-3 px-4 font-semibold">Descrição</th>
                            <th className="py-3 px-4 font-semibold text-center">Filmes</th>
                            <th className="py-3 px-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2c3440] text-sm">
                        {loading && !data ? (
                            <tr><td colSpan={4}><Loading /></td></tr>
                        ) : error ? (
                            <tr><td colSpan={4} className="p-4"><LoadError message={error} /></td></tr>
                        ) : sorted.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-[#678] text-sm">
                                    Nenhum gênero cadastrado.
                                    <Link to="/admin/genres/new" className={emptyLink}>Cadastrar o primeiro gênero</Link>
                                </td>
                            </tr>
                        ) : (
                            paginate(sorted, page, PER_PAGE).map((genre) => {
                                const count = movieCount(genre.id);

                                return (
                                    <tr key={genre.id} className={tableRow}>
                                        <td className="py-3 px-4 font-semibold text-white">
                                            {genre.name}
                                            {!genre.active && <InactiveBadge />}
                                        </td>
                                        <td className="py-3 px-4 text-[#678]">{genre.description || "—"}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-block min-w-[3.5rem] bg-[#2c3440] text-[#9ab] text-xs px-2.5 py-0.5 rounded-[3px] tabular-nums">
                                                {count} {plural(count, "filme", "filmes")}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-4 text-[11px] font-semibold uppercase tracking-[0.1em]">
                                                <Link to={`/admin/genres/${genre.id}/edit`} className={editAction}>Editar</Link>
                                                <button type="button" onClick={() => remove(genre)} className={deleteAction}>
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Paginação */}
                {sorted.length > PER_PAGE && (
                    <div className="p-4 border-t border-[#2c3440]">
                        <Pagination page={page} perPage={PER_PAGE} total={sorted.length} />
                    </div>
                )}
            </div>
        </div>
    );
}
