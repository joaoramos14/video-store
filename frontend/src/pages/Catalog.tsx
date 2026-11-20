import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { genresApi, moviesApi } from "../api";
import { LoadError, Loading } from "../components/PageState";
import { Pagination, pageFrom, paginate } from "../components/Pagination";
import { emptyLink, filterField, filterLabel } from "../components/ui";
import { useLoad } from "../hooks/useLoad";
import { formatMoney, plural } from "../utils/format";
import { useTitle } from "../hooks/useTitle";

const PER_PAGE = 12;

export function Catalog() {
    useTitle("Catálogo");
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const page = pageFrom(search);

    const title = search.get("title") ?? "";
    const genreId = search.get("genre_id") ?? "";
    const year = search.get("year") ?? "";
    const hasFilters = title !== "" || genreId !== "" || year !== "";

    const [form, setForm] = useState({ title, genre_id: genreId, year });

    const { data, error, loading } = useLoad(() => Promise.all([moviesApi.list(), genresApi.list()]));

    function submit(event: FormEvent) {
        event.preventDefault();

        const params = new URLSearchParams();
        if (form.title.trim()) params.set("title", form.title.trim());
        if (form.genre_id) params.set("genre_id", form.genre_id);
        if (form.year) params.set("year", form.year);

        const query = params.toString();
        navigate(query ? `/?${query}` : "/");
    }

    function clear() {
        setForm({ title: "", genre_id: "", year: "" });
    }

    const [movies, genres] = data ?? [[], []];

    // Catálogo: só filmes e gêneros ativos, em ordem alfabética.
    const activeGenres = genres
        .filter((genre) => genre.active)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const genreName = new Map(genres.map((genre) => [genre.id, genre.name]));
    const activeMovies = movies.filter((movie) => movie.active);
    const years = [...new Set(activeMovies.map((movie) => movie.year))].sort((a, b) => b - a);

    const filtered = activeMovies
        .filter((movie) => !title || movie.title.toLowerCase().includes(title.toLowerCase()))
        .filter((movie) => !genreId || movie.genre_id === genreId)
        .filter((movie) => !year || String(movie.year) === year)
        .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-white text-3xl font-bold tracking-tight">Catálogo</h1>
                <p className="text-sm text-[#678] mt-1">Escolha um filme e alugue por dia.</p>
            </div>

            {/* Filtros */}
            <form
                onSubmit={submit}
                className="grid grid-cols-1 sm:grid-cols-[1fr_180px_120px_auto] gap-4 items-end bg-[#1b2229] border border-[#2c3440] rounded-[3px] p-4 mb-10"
            >
                <div>
                    <label htmlFor="title" className={filterLabel}>Título</label>
                    <input
                        type="text"
                        id="title"
                        value={form.title}
                        onChange={(event) => setForm({ ...form, title: event.target.value })}
                        placeholder="Buscar por título"
                        className={filterField}
                    />
                </div>

                <div>
                    <label htmlFor="genre_id" className={filterLabel}>Gênero</label>
                    <select
                        id="genre_id"
                        value={form.genre_id}
                        onChange={(event) => setForm({ ...form, genre_id: event.target.value })}
                        className={filterField}
                    >
                        <option value="">Todos</option>
                        {activeGenres.map((genre) => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="year" className={filterLabel}>Ano</label>
                    <select
                        id="year"
                        value={form.year}
                        onChange={(event) => setForm({ ...form, year: event.target.value })}
                        className={`${filterField} tabular-nums`}
                    >
                        <option value="">Todos</option>
                        {years.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="px-5 py-2 bg-[#53c7ff] hover:bg-[#8fdcff] text-[#14181c] text-xs font-bold uppercase tracking-[0.1em] rounded-[3px] transition-colors"
                    >
                        Filtrar
                    </button>
                    {hasFilters && (
                        <Link
                            to="/"
                            onClick={clear}
                            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#678] hover:text-white transition-colors"
                        >
                            Limpar
                        </Link>
                    )}
                </div>
            </form>

            {/* Título de seção com contagem */}
            <div className="flex items-baseline justify-between border-b border-[#456] pb-1 mb-6">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9ab]">
                    {hasFilters ? "Resultados" : "Todos os filmes"}
                </h2>
                <span className="text-[11px] text-[#678] tabular-nums">
                    {filtered.length} {plural(filtered.length, "filme", "filmes")}
                </span>
            </div>

            {loading && !data ? (
                <Loading />
            ) : error ? (
                <LoadError message={error} />
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#678]">
                    Nenhum filme encontrado com esses filtros.
                    <Link to="/" onClick={clear} className={emptyLink}>Limpar filtros</Link>
                </div>
            ) : (
                <>
                    {/* Grade de pôsteres */}
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-8">
                        {paginate(filtered, page, PER_PAGE).map((movie) => {
                            const available = movie.stock > 0;

                            return (
                                <li key={movie.id}>
                                    <Link to={`/movies/${movie.id}`} className="group block focus:outline-none">
                                        {/* Pôster */}
                                        <div className="relative aspect-[2/3] rounded-[3px] overflow-hidden bg-[#2c3440] ring-1 ring-inset ring-white/15 group-hover:ring-2 group-hover:ring-[#53c7ff] group-focus-visible:ring-2 group-focus-visible:ring-[#53c7ff] transition-shadow">
                                            {movie.cover ? (
                                                <img
                                                    src={movie.cover}
                                                    alt={`Capa de ${movie.title}`}
                                                    loading="lazy"
                                                    className={`w-full h-full object-cover ${available ? "" : "opacity-50 grayscale"}`}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-center text-sm text-[#678] px-4">
                                                    {movie.title}
                                                </div>
                                            )}
                                        </div>

                                        {/* Informações */}
                                        <div className="mt-3 space-y-1">
                                            <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[#53c7ff] transition-colors">
                                                {movie.title}
                                            </h3>
                                            <p className="text-xs text-[#678] tabular-nums">
                                                {movie.year} &middot; {genreName.get(movie.genre_id) ?? "Sem gênero"}
                                            </p>

                                            <div className="flex items-center justify-between pt-1 text-xs">
                                                <span className="text-[#9ab] tabular-nums">
                                                    {formatMoney(movie.daily_price)}<span className="text-[#678]">/dia</span>
                                                </span>
                                            </div>

                                            <p className={`text-[11px] flex items-center gap-1.5 ${available ? "text-[#9ab]" : "text-[#ff9b9b]"}`}>
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${available ? "bg-[#53c7ff]" : "bg-[#ff5b5b]"}`}></span>
                                                {available ? "Disponível" : "Indisponível"}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-12">
                        <Pagination page={page} perPage={PER_PAGE} total={filtered.length} />
                    </div>
                </>
            )}
        </div>
    );
}
