import { Link, useSearchParams } from "react-router";
import { customersApi } from "../../api";
import { errorMessage } from "../../api/client";
import type { Customer } from "../../api/types";
import { LoadError, Loading } from "../../components/PageState";
import { Pagination, pageFrom, paginate } from "../../components/Pagination";
import { deleteAction, editAction, emptyLink, panel, sectionTitle, tableHead, tableRow } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { useLoad } from "../../hooks/useLoad";
import { InactiveBadge, ListHeader } from "./AdminPage";
import { useTitle } from "../../hooks/useTitle";

const PER_PAGE = 10;

// 12345678901 → 123.456.789-01
export function formatCpf(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function Customers() {
    useTitle("Clientes");
    const [search] = useSearchParams();
    const page = pageFrom(search);
    const flash = useFlash();

    const { data, error, loading } = useLoad(() => customersApi.list());

    async function remove(customer: Customer) {
        if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

        try {
            await customersApi.remove(customer.id);
            flash.status("Cliente excluído com sucesso!", "/admin/customers");
        } catch (exception) {
            flash.error(errorMessage(exception));
        }
    }

    const sorted = [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return (
        <div>
            <ListHeader
                title="Clientes"
                description="Clientes que podem reservar e alugar filmes."
                newLabel="Novo cliente"
                newTo="/admin/customers/new"
            />

            <h2 className={sectionTitle}>Todos os clientes</h2>

            <div className={`${panel} overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={tableHead}>
                            <th className="py-3 px-4 font-semibold">Cliente</th>
                            <th className="py-3 px-4 font-semibold">CPF</th>
                            <th className="py-3 px-4 font-semibold">Telefone</th>
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
                                    Nenhum cliente cadastrado.
                                    <Link to="/admin/customers/new" className={emptyLink}>Cadastrar o primeiro cliente</Link>
                                </td>
                            </tr>
                        ) : (
                            paginate(sorted, page, PER_PAGE).map((customer) => (
                                <tr key={customer.id} className={tableRow}>
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-white">
                                            {customer.name}
                                            {!customer.active && <InactiveBadge />}
                                        </p>
                                        <p className="text-xs text-[#678]">{customer.email}</p>
                                    </td>
                                    <td className="py-3 px-4 text-[#9ab] tabular-nums whitespace-nowrap">{formatCpf(customer.cpf)}</td>
                                    <td className="py-3 px-4 text-[#9ab] tabular-nums whitespace-nowrap">{customer.phone || "—"}</td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-4 text-[11px] font-semibold uppercase tracking-[0.1em]">
                                            <Link to={`/admin/customers/${customer.id}/edit`} className={editAction}>Editar</Link>
                                            <button type="button" onClick={() => remove(customer)} className={deleteAction}>
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
