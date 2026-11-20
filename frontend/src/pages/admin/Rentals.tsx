import { Link, useSearchParams } from "react-router";
import { customersApi, moviesApi, rentalsApi } from "../../api";
import { errorMessage } from "../../api/client";
import type { Customer, Movie, Rental } from "../../api/types";
import { LoadError, Loading } from "../../components/PageState";
import { Pagination, pageFrom, paginate } from "../../components/Pagination";
import { RentalStatusBadge } from "../../components/RentalStatusBadge";
import { panel, tableHead, tableRow } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { useLoad } from "../../hooks/useLoad";
import { formatDate, formatDayMonthTime, formatMoney, plural } from "../../utils/format";
import { displayStatus, isClosedWithoutPickup, type DisplayStatus } from "../../utils/rentalStatus";
import { useTitle } from "../../hooks/useTitle";

const PER_PAGE = 15;

const tabs: [DisplayStatus | null, string][] = [
    [null, "Todos"],
    ["reserved", "Reservados"],
    ["active", "Em andamento"],
    ["late", "Atrasados"],
    ["returned", "Devolvidos"],
    ["cancelled", "Cancelados"],
    ["expired", "Expirados"],
];

export function Rentals() {
    useTitle("Retiradas e devoluções");
    const [search] = useSearchParams();
    const page = pageFrom(search);
    const status = search.get("status");
    const flash = useFlash();

    const { data, error, loading } = useLoad(async () => {
        // Expira as reservas vencidas antes de listar (o PHP faz isso com uma tarefa agendada).
        await rentalsApi.expireReservations().catch(() => null);

        // A aba usa a busca por status da API (que também entende "late").
        return Promise.all([
            status ? rentalsApi.search(status) : rentalsApi.list(),
            customersApi.list(),
            moviesApi.list(),
        ]);
    }, [status]);

    const [rentals, customers, movies] = data ?? [[], [], []];
    const customerById = new Map(customers.map((customer) => [customer.id, customer]));
    const movieById = new Map(movies.map((movie) => [movie.id, movie]));

    async function pickUp(rental: Rental, movie: Movie | undefined, customer: Customer | undefined) {
        if (!window.confirm(`Confirmar a retirada de ${movie?.title ?? "este filme"} por ${customer?.name ?? "este cliente"}?`)) return;

        try {
            const updated = await rentalsApi.pickUp(rental.id);
            flash.status(`Retirada confirmada. Devolução prevista para ${updated.due_at ? formatDate(updated.due_at) : "—"}.`);
        } catch (exception) {
            flash.error(errorMessage(exception));
        }
    }

    async function giveBack(rental: Rental, movie: Movie | undefined) {
        if (!window.confirm(`Registrar a devolução de ${movie?.title ?? "este filme"}?`)) return;

        try {
            const updated = await rentalsApi.returnMovie(rental.id);
            let message = "Devolução registrada com sucesso!";
            if (updated.late_fee > 0) message += ` Multa por atraso: ${formatMoney(updated.late_fee)}`;
            flash.status(message);
        } catch (exception) {
            flash.error(errorMessage(exception));
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-white text-3xl font-bold tracking-tight">Retiradas e devoluções</h1>
                <p className="text-sm text-[#678] mt-1">Confirme a retirada quando o cliente chegar à loja e registre a devolução do filme.</p>
            </div>

            {/* Filtro por situação */}
            <nav className="flex flex-wrap gap-x-5 gap-y-2 border-b border-[#456] text-[12px] font-semibold uppercase tracking-[0.1em]" aria-label="Filtrar por situação">
                {tabs.map(([key, tabLabel]) => {
                    const current = status === key;

                    return (
                        <Link
                            key={tabLabel}
                            to={key ? `/admin/rentals?status=${key}` : "/admin/rentals"}
                            aria-current={current ? "page" : undefined}
                            className={`pb-1 -mb-px border-b-2 transition-colors ${current ? "text-white border-[#53c7ff]" : "text-[#9ab] border-transparent hover:text-white"}`}
                        >
                            {tabLabel}
                        </Link>
                    );
                })}
            </nav>

            <div className={`${panel} overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={tableHead}>
                            <th className="py-3 px-4 font-semibold">Cliente</th>
                            <th className="py-3 px-4 font-semibold">Filme</th>
                            <th className="py-3 px-4 font-semibold">Retirada</th>
                            <th className="py-3 px-4 font-semibold">Devolução</th>
                            <th className="py-3 px-4 font-semibold text-right">Valor</th>
                            <th className="py-3 px-4 font-semibold">Situação</th>
                            <th className="py-3 px-4 font-semibold text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2c3440] text-sm">
                        {loading && !data ? (
                            <tr><td colSpan={7}><Loading /></td></tr>
                        ) : error ? (
                            <tr><td colSpan={7} className="p-4"><LoadError message={error} /></td></tr>
                        ) : rentals.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-[#678] text-sm">
                                    Nenhum aluguel {status ? "nesta situação" : "registrado"}.
                                </td>
                            </tr>
                        ) : (
                            paginate(rentals, page, PER_PAGE).map((rental) => {
                                const state = displayStatus(rental);
                                const customer = customerById.get(rental.customer_id);
                                const movie = movieById.get(rental.movie_id);

                                return (
                                    <tr key={rental.id} className={tableRow}>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-white">{customer?.name ?? "—"}</p>
                                            <p className="text-xs text-[#678]">{customer?.email}</p>
                                        </td>
                                        <td className="py-3 px-4 text-[#9ab]">{movie?.title ?? "—"}</td>

                                        {/* Retirada: data real ou, se for reserva, até quando o cliente pode retirar */}
                                        <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                                            {state === "reserved" ? (
                                                <span className="text-[#b5e8ff]">até {formatDayMonthTime(rental.reserved_until)}</span>
                                            ) : rental.rented_at ? (
                                                <span className="text-[#9ab]">{formatDate(rental.rented_at)}</span>
                                            ) : (
                                                <span className="text-[#456]">—</span>
                                            )}
                                        </td>

                                        {/* Devolução: data devolvida, prazo ou, se ainda não retirou, só os dias */}
                                        <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                                            {rental.returned_at ? (
                                                <span className="text-[#9ab]">{formatDate(rental.returned_at)}</span>
                                            ) : rental.due_at ? (
                                                <span className={state === "late" ? "text-[#ff9b9b]" : "text-[#9ab]"}>até {formatDate(rental.due_at)}</span>
                                            ) : state === "reserved" ? (
                                                <span className="text-[#678]">{rental.days} {plural(rental.days, "dia", "dias")} após retirar</span>
                                            ) : (
                                                <span className="text-[#456]">—</span>
                                            )}
                                        </td>

                                        <td className={`py-3 px-4 text-right tabular-nums whitespace-nowrap ${isClosedWithoutPickup(state) ? "text-[#678] line-through" : "text-white"}`}>
                                            {formatMoney(rental.total_price + rental.late_fee)}
                                            {rental.late_fee > 0 && (
                                                <span className="block text-xs text-[#ff9b9b] no-underline">multa {formatMoney(rental.late_fee)}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4"><RentalStatusBadge status={state} /></td>

                                        <td className="py-3 px-4 text-right">
                                            {state === "reserved" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => pickUp(rental, movie, customer)}
                                                    className="px-3 py-1.5 bg-[#53c7ff] hover:bg-[#8fdcff] text-[#14181c] text-[11px] font-bold uppercase tracking-[0.1em] rounded-[3px] transition-colors whitespace-nowrap"
                                                >
                                                    Confirmar retirada
                                                </button>
                                            ) : state === "active" || state === "late" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => giveBack(rental, movie)}
                                                    className="px-3 py-1.5 bg-[#456] hover:bg-[#567] text-white text-[11px] font-bold uppercase tracking-[0.1em] rounded-[3px] transition-colors whitespace-nowrap"
                                                >
                                                    Registrar devolução
                                                </button>
                                            ) : (
                                                <span className="text-[#456]">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {rentals.length > PER_PAGE && (
                    <div className="p-4 border-t border-[#2c3440]">
                        <Pagination page={page} perPage={PER_PAGE} total={rentals.length} />
                    </div>
                )}
            </div>
        </div>
    );
}
