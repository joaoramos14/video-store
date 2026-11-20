import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { customersApi } from "../../api";
import { errorMessage } from "../../api/client";
import type { CustomerInput } from "../../api/types";
import { LoadError, Loading } from "../../components/PageState";
import { field, fieldError, label } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { useProfile } from "../../hooks/useProfile";
import { ActiveCheckbox, FormActions, FormPage } from "./AdminPage";
import { useTitle } from "../../hooks/useTitle";

export function CustomerForm() {
    const { id } = useParams();
    const editing = id !== undefined;
    const flash = useFlash();
    const { reloadCustomers } = useProfile();
    useTitle(editing ? "Editar cliente" : "Novo cliente");

    const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "", active: true });
    const [loading, setLoading] = useState(editing);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!id) return;

        customersApi
            .get(id)
            .then((customer) =>
                setForm({
                    name: customer.name,
                    email: customer.email,
                    cpf: customer.cpf,
                    phone: customer.phone ?? "",
                    active: customer.active,
                }),
            )
            .catch((exception: unknown) => setLoadError(errorMessage(exception)))
            .finally(() => setLoading(false));
    }, [id]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSending(true);
        setError(null);

        // CPF vai só com os números.
        const input: CustomerInput = { name: form.name, email: form.email, cpf: form.cpf.replace(/\D/g, "") };
        if (form.phone.trim()) input.phone = form.phone;

        try {
            if (id) {
                await customersApi.update(id, { ...input, active: form.active });
                reloadCustomers();
                flash.status("Cliente atualizado com sucesso!", "/admin/customers");
            } else {
                await customersApi.create(input);
                reloadCustomers();
                flash.status("Cliente cadastrado com sucesso!", "/admin/customers");
            }
        } catch (exception) {
            setError(errorMessage(exception));
            setSending(false);
        }
    }

    return (
        <FormPage
            width="max-w-xl"
            backTo="/admin/customers"
            backLabel="Clientes"
            title={editing ? "Editar cliente" : "Novo cliente"}
            description={editing ? form.name || "Atualize os dados do cliente." : "Cadastre um cliente para reservar filmes."}
            section="Dados do cliente"
        >
            {loading ? (
                <Loading />
            ) : loadError ? (
                <LoadError message={loadError} />
            ) : (
                <form onSubmit={submit} className="space-y-6" autoComplete="off">
                    <div>
                        <label htmlFor="c_name" className={label}>Nome</label>
                        <input type="text" id="c_name" required value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })} className={field} />
                    </div>

                    <div>
                        <label htmlFor="c_email" className={label}>E-mail</label>
                        <input type="email" id="c_email" required value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })} className={field} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="c_cpf" className={label}>CPF</label>
                            <input type="text" id="c_cpf" required inputMode="numeric" placeholder="Somente números"
                                value={form.cpf} onChange={(event) => setForm({ ...form, cpf: event.target.value })}
                                className={`${field} tabular-nums`} />
                        </div>

                        <div>
                            <label htmlFor="c_phone" className={label}>Telefone</label>
                            <input type="text" id="c_phone" value={form.phone}
                                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                className={`${field} tabular-nums`} />
                        </div>
                    </div>

                    {editing && (
                        <ActiveCheckbox
                            checked={form.active}
                            onChange={(active) => setForm({ ...form, active })}
                            help="Clientes inativos não podem fazer reservas."
                        />
                    )}

                    {error && <p className={fieldError}>{error}</p>}

                    <FormActions
                        cancelTo="/admin/customers"
                        submitLabel={editing ? "Salvar alterações" : "Salvar cliente"}
                        sending={sending}
                    />
                </form>
            )}
        </FormPage>
    );
}
