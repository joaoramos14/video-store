import { Link, useSearchParams } from "react-router";
import { customersApi, moviesApi, rentalsApi } from "../api";
import { errorMessage } from "../api/client";
import type { Movie, Rental } from "../api/types";
import { LoadError, Loading, MissingCustomer } from "../components/PageState";
import { Pagination, pageFrom, paginate } from "../components/Pagination";
import { RentalStatusBadge } from "../components/RentalStatusBadge";
import { emptyLink } from "../components/ui";
import { useFlash } from "../hooks/useFlash";
import { useLoad } from "../hooks/useLoad";
import { CUSTOMER_ID } from "../hooks/useProfile";
import { formatDate, formatMoney, formatTime, plural } from "../utils/format";
import { displayStatus, isClosedWithoutPickup } from "../utils/rentalStatus";
import { useTitle } from "../hooks/useTitle";

const PER_PAGE = 10;

const term = "text-[11px] uppercase tracking-[0.1em] text-[#678]";

export function MyRentals() {
    useTitle("Meus aluguéis");
    const [search] = useSearchParams();
    const page = pageFrom(search);
    const flash = useFlash();

    const { data, error, loading } = useLoad(async () => {
        if (!CUSTOMER_ID) return null;

        // Expira as reservas vencidas antes de listar (o PHP faz isso com uma tarefa agendada).
        await rentalsApi.expireReservations().catch(() => null);

        const [rentals, movies] = await Promise.all([customersApi.rentals(CUSTOMER_ID), moviesApi.list()]);
        return { rentals, movies };
    });

    async function cancel(rental: Rental) {
        if (!window.confirm("Cancelar esta reserva?")) return;

        try {
            await rentalsApi.cancel(rental.id);
            flash.status("Reserva cancelada.");
        } catch (exception) {
            flash.error(errorMessage(exception));
        }
    }

    const rentals = [...(data?.rentals ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const movieById = new Map((data?.movies ?? []).map((movie) => [movie.id, movie]));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-white text-3xl font-bold tracking-tight">Meus aluguéis</h1>
                <p className="text-sm text-[#678] mt-1">Reserve pelo site, retire e devolva na loja.</p>
            </div>

            <div className="flex items-baseline justify-between border-b border-[#456] pb-1">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#9ab]">Histórico</h2>
                <span className="text-[11px] text-[#678] tabular-nums">
                    {rentals.length} {plural(rentals.length, "aluguel", "aluguéis")}
                </span>
            </div>

            {!CUSTOMER_ID ? (
                <div className="mt-6"><MissingCustomer /></div>
            ) : loading && !data ? (
                <Loading />
            ) : error ? (
                <div className="mt-6"><LoadError message={error} /></div>
            ) : rentals.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#678]">
                    Você ainda não reservou nenhum filme.
                    <Link to="/" className={emptyLink}>Ver o catálogo</Link>
                </div>
            ) : (
                <>
                    <ul className="divide-y divide-[#2c3440] bg-[#1b2229] border-x border-b border-[#2c3440] rounded-b-[3px]">
                        {paginate(rentals, page, PER_PAGE).map((rental) => (
                            <RentalItem
                                key={rental.id}
                                rental={rental}
                                movie={movieById.get(rental.movie_id)}
                                onCancel={() => cancel(rental)}
                            />
                        ))}
                    </ul>

                    <div className="mt-10">
                        <Pagination page={page} perPage={PER_PAGE} total={rentals.length} />
                    </div>
                </>
            )}
        </div>
    );
}

interface RentalItemProps {
    rental: Rental;
    movie: Movie | undefined;
    onCancel: () => void;
}

function RentalItem({ rental, movie, onCancel }: RentalItemProps) {
    const state = displayStatus(rental);
    const closed = isClosedWithoutPickup(state);
    const title = movie?.title ?? "Filme removido";
    const daysLabel = `${rental.days} ${plural(rental.days, "dia", "dias")}`;

    return (
        <li className="p-5">
            <div className="flex gap-4">
                {/* Capa */}
                <Link to={`/movies/${rental.movie_id}`} className="shrink-0">
                    {movie?.cover ? (
                        <img
                            src={movie.cover}
                            alt={`Capa de ${title}`}
                            loading="lazy"
                            className={`w-16 aspect-[2/3] object-cover rounded-[3px] ring-1 ring-inset ring-white/15 bg-[#2c3440] ${closed ? "opacity-50 grayscale" : ""}`}
                        />
                    ) : (
                        <div className="w-16 aspect-[2/3] rounded-[3px] ring-1 ring-inset ring-white/10 bg-[#2c3440]"></div>
                    )}
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-white font-semibold leading-snug">
                            <Link to={`/movies/${rental.movie_id}`} className="hover:text-[#53c7ff] transition-colors">{title}</Link>
                            {movie && <span className="text-[#678] font-normal tabular-nums"> {movie.year}</span>}
                        </h3>
                        <RentalStatusBadge status={state} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className={term}>Reservado em</dt>
                            <dd className="text-[#9ab] tabular-nums">{formatDate(rental.created_at)}</dd>
                        </div>

                        <div>
                            {state === "reserved" ? (
                                <>
                                    <dt className={term}>Retirar até</dt>
                                    <dd className="text-[#b5e8ff] tabular-nums">
                                        {formatDate(rental.reserved_until)}
                                        <span className="block text-xs text-[#678]">às {formatTime(rental.reserved_until)}</span>
                                    </dd>
                                </>
                            ) : (
                                <>
                                    <dt className={term}>Retirado em</dt>
                                    <dd className="text-[#9ab] tabular-nums">{rental.rented_at ? formatDate(rental.rented_at) : "—"}</dd>
                                </>
                            )}
                        </div>

                        <div>
                            {rental.returned_at ? (
                                <>
                                    <dt className={term}>Devolvido em</dt>
                                    <dd className="text-[#9ab] tabular-nums">{formatDate(rental.returned_at)}</dd>
                                </>
                            ) : rental.due_at ? (
                                <>
                                    <dt className={term}>Devolver até</dt>
                                    <dd className={`tabular-nums ${state === "late" ? "text-[#ff9b9b]" : "text-[#9ab]"}`}>
                                        {formatDate(rental.due_at)} <span className="text-[#678]">({daysLabel})</span>
                                    </dd>
                                </>
                            ) : (
                                <>
                                    <dt className={term}>Prazo</dt>
                                    <dd className="text-[#9ab] tabular-nums">
                                        {daysLabel}
                                        {state === "reserved" && <span className="block text-xs text-[#678]">a partir da retirada</span>}
                                    </dd>
                                </>
                            )}
                        </div>

                        <div>
                            <dt className={term}>Valor</dt>
                            <dd className={`tabular-nums ${closed ? "text-[#678] line-through" : "text-white"}`}>
                                {formatMoney(rental.total_price + rental.late_fee)}
                                {rental.late_fee > 0 && (
                                    <span className="block text-xs text-[#ff9b9b] no-underline">
                                        inclui multa de {formatMoney(rental.late_fee)}
                                    </span>
                                )}
                            </dd>
                        </div>
                    </dl>

                    {/* Avisos e ações de acordo com a situação */}
                    {state === "reserved" && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-[#b5e8ff]">
                                Retire o filme na loja dentro do prazo. Depois disso a reserva expira e a cópia volta para o estoque.
                            </p>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#678] hover:text-[#ff7b7b] transition-colors"
                            >
                                Cancelar reserva
                            </button>
                        </div>
                    )}

                    {state === "expired" && (
                        <p className="mt-4 text-xs text-[#678]">
                            O prazo de retirada terminou e a reserva expirou. Você pode reservar o filme de novo.
                        </p>
                    )}

                    {state === "late" && (
                        <p className="mt-4 text-xs text-[#ff9b9b]">
                            O prazo venceu. Devolva o filme na loja para evitar mais dias de multa.
                        </p>
                    )}
                </div>
            </div>
        </li>
    );
}
