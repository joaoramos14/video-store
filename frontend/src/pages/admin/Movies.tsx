import { Link, useSearchParams } from "react-router";
import { genresApi, moviesApi } from "../../api";
import { errorMessage } from "../../api/client";
import type { Movie } from "../../api/types";
import { LoadError, Loading } from "../../components/PageState";
import { Pagination, pageFrom, paginate } from "../../components/Pagination";
import { deleteAction, editAction, emptyLink, panel, sectionTitle, tableHead, tableRow } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { useLoad } from "../../hooks/useLoad";
import { formatMoney } from "../../utils/format";
import { InactiveBadge, ListHeader } from "./AdminPage";
import { useTitle } from "../../hooks/useTitle";

const PER_PAGE = 10;

export function Movies() {
    useTitle("Filmes");
    const [search] = useSearchParams();
    const page = pageFrom(search);
    const flash = useFlash();

    const { data, error, loading } = useLoad(() => Promise.all([moviesApi.list(), genresApi.list()]));

    async function remove(movie: Movie) {
        if (!window.confirm("Tem certeza que deseja excluir este filme?")) return;

        try {
            await moviesApi.remove(movie.id);
            flash.status("Filme excluído com sucesso!", "/admin/movies");
        } catch (exception) {
            flash.error(errorMessage(exception));
        }
    }

    const [movies, genres] = data ?? [[], []];
    const genreName = new Map(genres.map((genre) => [genre.id, genre.name]));
    const sorted = [...movies].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

    return (
        <div>
            <ListHeader
                title="Filmes"
                description="Filmes disponíveis para aluguel no catálogo."
                newLabel="Novo filme"
                newTo="/admin/movies/new"
            />

            <h2 className={sectionTitle}>Todos os filmes</h2>

            <div className={`${panel} overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={tableHead}>
                            <th className="py-3 px-4 font-semibold">Filme</th>
                            <th className="py-3 px-4 font-semibold">Gênero</th>
                            <th className="py-3 px-4 font-semibold text-right">Diária</th>
                            <th className="py-3 px-4 font-semibold text-center">Estoque</th>
                            <th className="py-3 px-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2c3440] text-sm">
                        {loading && !data ? (
                            <tr><td colSpan={5}><Loading /></td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="p-4"><LoadError message={error} /></td></tr>
                        ) : sorted.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-[#678] text-sm">
                                    Nenhum filme cadastrado.
                                    <Link to="/admin/movies/new" className={emptyLink}>Cadastrar o primeiro filme</Link>
                                </td>
                            </tr>
                        ) : (
                            paginate(sorted, page, PER_PAGE).map((movie) => (
                                <tr key={movie.id} className={tableRow}>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-4">
                                            {movie.cover ? (
                                                <img
                                                    src={movie.cover}
                                                    alt={`Capa de ${movie.title}`}
                                                    loading="lazy"
                                                    className="w-10 aspect-[2/3] object-cover rounded-[3px] ring-1 ring-inset ring-white/15 bg-[#2c3440]"
                                                />
                                            ) : (
                                                <div className="w-10 aspect-[2/3] rounded-[3px] ring-1 ring-inset ring-white/10 bg-[#2c3440]"></div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-semibold text-white truncate">
                                                    {movie.title}
                                                    {!movie.active && <InactiveBadge />}
                                                </p>
                                                <p className="text-xs text-[#678] tabular-nums">
                                                    {movie.year}
                                                    {movie.director && <> &middot; {movie.director}</>}
                                                    {" "}&middot; {movie.duration} min
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-[#9ab]">{genreName.get(movie.genre_id) ?? "—"}</td>
                                    <td className="py-3 px-4 text-right text-[#9ab] tabular-nums whitespace-nowrap">
                                        {formatMoney(movie.daily_price)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`inline-block min-w-[2.5rem] text-xs px-2.5 py-0.5 rounded-[3px] tabular-nums ${movie.stock > 0 ? "bg-[#2c3440] text-[#9ab]" : "bg-[#ff5b5b]/15 text-[#ff9b9b]"}`}
                                        >
                                            {movie.stock}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-4 text-[11px] font-semibold uppercase tracking-[0.1em]">
                                            <Link to={`/admin/movies/${movie.id}/edit`} className={editAction}>Editar</Link>
                                            <button type="button" onClick={() => remove(movie)} className={deleteAction}>
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {sorted.length > PER_PAGE && (
                    <div className="p-4 border-t border-[#2c3440]">
                        <Pagination page={page} perPage={PER_PAGE} total={sorted.length} />
                    </div>
                )}
            </div>
        </div>
    );
}
