import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { customersApi, genresApi, moviesApi, rentalsApi } from "../api";
import { errorMessage } from "../api/client";
import { LoadError, Loading, MissingCustomer } from "../components/PageState";
import { backLink, label, sectionTitle } from "../components/ui";
import { useFlash } from "../hooks/useFlash";
import { useLoad } from "../hooks/useLoad";
import { useProfile } from "../hooks/useProfile";
import { formatDate, formatMoney, formatTime, plural } from "../utils/format";
import { useTitle } from "../hooks/useTitle";

const MAX_DAYS = 30;
const RESERVATION_HOURS = 24;

export function MovieDetail() {
    const { id = "" } = useParams();
    const flash = useFlash();
    const { customerId } = useProfile();
    const [days, setDays] = useState("3");
    const [sending, setSending] = useState(false);

    const { data, error, loading } = useLoad(async () => {
        const movie = await moviesApi.get(id);
        const [genre, rentals] = await Promise.all([
            genresApi.get(movie.genre_id).catch(() => null),
            customerId ? customersApi.rentals(customerId).catch(() => []) : Promise.resolve([]),
        ]);

        return { movie, genre, rentals };
    }, [id, customerId]);

    useTitle(data?.movie.title ?? "Filme");

    if (loading && !data) return <Loading />;
    if (error || !data) return <LoadError message={error ?? "Filme não encontrado."} />;

    const { movie, genre, rentals } = data;
    const available = movie.stock > 0;

    // Reserva ou aluguel em andamento deste filme para o cliente.
    const openRental = rentals.find(
        (rental) => rental.movie_id === movie.id && (rental.status === "reserved" || rental.status === "active"),
    );

    // Total e devolução calculados conforme os dias digitados.
    const dayCount = Math.min(Math.max(parseInt(days, 10) || 0, 0), MAX_DAYS);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dayCount);

    async function reserve(event: FormEvent) {
        event.preventDefault();

        if (!customerId) return;

        setSending(true);

        try {
            await rentalsApi.create({ customer_id: customerId, movie_id: movie.id, days: Number(days) });
            flash.status(`Reserva feita! Retire o filme na loja em até ${RESERVATION_HOURS} horas.`, "/my-rentals");
        } catch (exception) {
            flash.error(errorMessage(exception));
        } finally {
            setSending(false);
        }
    }

    return (
        <div>
            <Link to="/" className={backLink}>&larr; Catálogo</Link>

            {/* Duas colunas: capa e informações. A faixa de aluguel ocupa as duas. */}
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-8 gap-y-8 mt-5">

                {/* Capa */}
                <div className="w-[150px] sm:w-[180px] aspect-[2/3] rounded-[3px] overflow-hidden bg-[#2c3440] ring-1 ring-inset ring-white/15">
                    {movie.cover ? (
                        <img src={movie.cover} alt={`Capa de ${movie.title}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-center text-sm text-[#678] px-4">
                            {movie.title}
                        </div>
                    )}
                </div>

                {/* Informações */}
                <div className="min-w-0">
                    <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{movie.title}</h1>

                    <p className="mt-2 text-sm text-[#9ab] tabular-nums">
                        <span className="text-white">{movie.year}</span>
                        {genre && (
                            <>
                                {" "}&middot;{" "}
                                <Link to={`/?genre_id=${genre.id}`} className="hover:text-[#53c7ff] transition-colors">
                                    {genre.name}
                                </Link>
                            </>
                        )}
                        {" "}&middot; {movie.duration} min
                    </p>

                    {movie.director && (
                        <p className="mt-1 text-sm text-[#678]">
                            Dirigido por <span className="text-[#9ab]">{movie.director}</span>
                        </p>
                    )}

                    {movie.synopsis && (
                        <p className="mt-5 max-w-[62ch] text-[15px] leading-7 text-[#9ab]">{movie.synopsis}</p>
                    )}
                </div>

                {/* Reserva: ocupa as duas colunas */}
                <section className="sm:col-span-2" aria-labelledby="alugar-titulo">
                    <h2 id="alugar-titulo" className={sectionTitle}>Reservar</h2>
                    <div className="bg-[#1b2229] border-x border-b border-[#2c3440] rounded-b-[3px] p-5">

                        {!customerId && (
                            <div className="mb-4">
                                <MissingCustomer />
                            </div>
                        )}

                        {openRental && (
                            <p className="mb-4 text-sm text-[#b5e8ff] bg-[#53c7ff]/10 border border-[#53c7ff]/30 rounded-[3px] px-3 py-2">
                                {openRental.status === "reserved" ? (
                                    <>
                                        Você reservou este filme. Retire na loja até{" "}
                                        <span className="tabular-nums">
                                            {formatDate(openRental.reserved_until)} às {formatTime(openRental.reserved_until)}
                                        </span>
                                        .{" "}
                                    </>
                                ) : (
                                    <>
                                        Você está com este filme. A devolução está prevista para{" "}
                                        <span className="tabular-nums">{openRental.due_at ? formatDate(openRental.due_at) : "—"}</span>.{" "}
                                    </>
                                )}
                                <Link to="/my-rentals" className="underline underline-offset-2 hover:text-white">Ver meus aluguéis</Link>
                            </p>
                        )}

                        <div className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-8">

                            {/* Preço e disponibilidade */}
                            <div className="lg:min-w-[190px]">
                                <p className="text-white tabular-nums">
                                    <span className="text-2xl font-bold">{formatMoney(movie.daily_price)}</span>{" "}
                                    <span className="text-sm text-[#678]">por dia</span>
                                </p>
                                <p className={`mt-1 text-xs flex items-center gap-1.5 ${available ? "text-[#9ab]" : "text-[#ff9b9b]"}`}>
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${available ? "bg-[#53c7ff]" : "bg-[#ff5b5b]"}`}></span>
                                    {available
                                        ? <>Disponível &middot; {movie.stock} {plural(movie.stock, "cópia", "cópias")}</>
                                        : "Indisponível no momento"}
                                </p>
                            </div>

                            {!openRental && available && (
                                <form onSubmit={reserve} className="flex-1 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                                    <div className="sm:w-32">
                                        <label htmlFor="days" className={label}>Dias</label>
                                        <input
                                            type="number"
                                            id="days"
                                            min={1}
                                            max={MAX_DAYS}
                                            step={1}
                                            required
                                            value={days}
                                            onChange={(event) => setDays(event.target.value)}
                                            className="w-full bg-[#2c3440] border border-transparent rounded-[3px] px-3 py-2.5 text-sm text-white tabular-nums focus:outline-none focus:border-[#53c7ff] focus:bg-[#14181c] transition-colors"
                                        />
                                    </div>

                                    <p className="flex-1 text-sm text-[#9ab] sm:pb-0.5">
                                        Total: <span className="text-white font-semibold tabular-nums">{formatMoney(movie.daily_price * dayCount)}</span>
                                        <span className="block text-xs text-[#678]">
                                            Devolução até <span className="tabular-nums">{dayCount > 0 ? formatDate(dueDate) : "—"}</span>, se retirar hoje
                                        </span>
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={sending || !customerId}
                                        className="px-8 py-2.5 bg-[#53c7ff] hover:bg-[#8fdcff] text-[#14181c] text-xs font-bold uppercase tracking-[0.1em] rounded-[3px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        Reservar
                                    </button>
                                </form>
                            )}

                            {!openRental && !available && (
                                <div className="lg:ml-auto">
                                    <button
                                        type="button"
                                        disabled
                                        className="px-8 py-2.5 bg-[#2c3440] text-[#678] text-xs font-bold uppercase tracking-[0.1em] rounded-[3px] cursor-not-allowed"
                                    >
                                        Indisponível
                                    </button>
                                </div>
                            )}
                        </div>

                        {!openRental && available && (
                            <p className="mt-4 text-xs text-[#678]">
                                Retire o filme na loja em até {RESERVATION_HOURS} horas.
                                O prazo de devolução só começa a contar na retirada.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
