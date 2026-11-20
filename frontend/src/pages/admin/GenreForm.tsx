import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { genresApi } from "../../api";
import { errorMessage } from "../../api/client";
import { LoadError, Loading } from "../../components/PageState";
import { field, fieldError, label } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { ActiveCheckbox, FormActions, FormPage } from "./AdminPage";
import { useTitle } from "../../hooks/useTitle";

export function GenreForm() {
    const { id } = useParams();
    const editing = id !== undefined;
    const flash = useFlash();
    useTitle(editing ? "Editar gênero" : "Novo gênero");

    const [form, setForm] = useState({ name: "", description: "", active: true });
    const [loading, setLoading] = useState(editing);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!id) return;

        genresApi
            .get(id)
            .then((genre) => setForm({ name: genre.name, description: genre.description ?? "", active: genre.active }))
            .catch((exception: unknown) => setLoadError(errorMessage(exception)))
            .finally(() => setLoading(false));
    }, [id]);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSending(true);
        setError(null);

        try {
            if (id) {
                await genresApi.update(id, form);
                flash.status("Gênero atualizado com sucesso!", "/admin/genres");
            } else {
                await genresApi.create({ name: form.name, description: form.description });
                flash.status("Gênero cadastrado com sucesso!", "/admin/genres");
            }
        } catch (exception) {
            setError(errorMessage(exception));
            setSending(false);
        }
    }

    return (
        <FormPage
            width="max-w-xl"
            backTo="/admin/genres"
            backLabel="Gêneros"
            title={editing ? "Editar gênero" : "Novo gênero"}
            description={editing ? "Atualize o nome que aparece no catálogo." : "Cadastre um gênero para organizar o catálogo."}
            section="Dados do gênero"
        >
            {loading ? (
                <Loading />
            ) : loadError ? (
                <LoadError message={loadError} />
            ) : (
                <form onSubmit={submit} className="space-y-6" autoComplete="off">
                    <div>
                        <label htmlFor="name" className={label}>Nome do gênero</label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            placeholder="Digite o nome, como Ação, Terror ou Comédia"
                            className={field}
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className={label}>Descrição</label>
                        <textarea
                            id="description"
                            rows={3}
                            value={form.description}
                            onChange={(event) => setForm({ ...form, description: event.target.value })}
                            className={`${field} resize-y leading-relaxed`}
                        />
                    </div>

                    {editing && (
                        <ActiveCheckbox
                            checked={form.active}
                            onChange={(active) => setForm({ ...form, active })}
                            help="Gêneros inativos não aparecem no catálogo e não recebem filmes novos."
                        />
                    )}

                    {error && <p className={fieldError}>{error}</p>}

                    <FormActions
                        cancelTo="/admin/genres"
                        submitLabel={editing ? "Salvar alterações" : "Salvar gênero"}
                        sending={sending}
                    />
                </form>
            )}
        </FormPage>
    );
}
