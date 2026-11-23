import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router";
import { genresApi, moviesApi } from "../../api";
import { errorMessage } from "../../api/client";
import type { Genre, MovieInput } from "../../api/types";
import { LoadError, Loading } from "../../components/PageState";
import { field, fieldError, label } from "../../components/ui";
import { useFlash } from "../../hooks/useFlash";
import { ActiveCheckbox, FormActions, FormPage } from "./AdminPage";
import { useTitle } from "../../hooks/useTitle";

const emptyForm = {
    title: "",
    director: "",
    year: "",
    duration: "",
    genre_id: "",
    daily_price: "",
    stock: "1",
    synopsis: "",
    cover: "",
    active: true,
};

type FormState = typeof emptyForm;

// Monta o corpo da requisição: campos opcionais vazios não são enviados.
function toInput(form: FormState): MovieInput {
    const input: MovieInput = {
        genre_id: form.genre_id,
        title: form.title,
        year: Number(form.year),
        duration: Number(form.duration),
        daily_price: Number(form.daily_price),
        stock: Number(form.stock),
    };

    if (form.director.trim()) input.director = form.director;
    if (form.synopsis.trim()) input.synopsis = form.synopsis;
    if (form.cover.trim()) input.cover = form.cover;

    return input;
}

export function MovieForm() {
    const { id } = useParams();
    const editing = id !== undefined;
    const flash = useFlash();
    useTitle(editing ? "Editar filme" : "Novo filme");

    const [form, setForm] = useState<FormState>(emptyForm);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        Promise.all([genresApi.list(), id ? moviesApi.get(id) : Promise.resolve(null)])
            .then(([genreList, movie]) => {
                setGenres(genreList.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));

                if (movie) {
                    setForm({
                        title: movie.title,
                        director: movie.director ?? "",
                        year: String(movie.year),
                        duration: String(movie.duration),
                        genre_id: movie.genre_id,
                        daily_price: String(movie.daily_price),
                        stock: String(movie.stock),
                        synopsis: movie.synopsis ?? "",
                        cover: movie.cover ?? "",
                        active: movie.active,
                    });
                }
            })
            .catch((exception: unknown) => setLoadError(errorMessage(exception)))
            .finally(() => setLoading(false));
    }, [id]);

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSending(true);
        setError(null);

        try {
            if (id) {
                await moviesApi.update(id, { ...toInput(form), active: form.active });
                flash.status("Filme atualizado com sucesso!", "/admin/movies");
            } else {
                await moviesApi.create(toInput(form));
                flash.status("Filme cadastrado com sucesso!", "/admin/movies");
            }
        } catch (exception) {
            setError(errorMessage(exception));
            setSending(false);
        }
    }

    // Prévia da capa: só mostra URL completa.
    const coverPreview = form.cover.trim().startsWith("http") ? form.cover.trim() : null;

    return (
        <FormPage
            width="max-w-3xl"
            backTo="/admin/movies"
            backLabel="Filmes"
            title={editing ? "Editar filme" : "Novo filme"}
            description={editing ? form.title || "Atualize os dados do filme." : "Preencha os dados do filme."}
            section="Dados do filme"
        >
            {loading ? (
                <Loading />
            ) : loadError ? (
                <LoadError message={loadError} />
            ) : (
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6">

                        {/* Capa */}
                        <div>
                            <div className="aspect-[2/3] w-40 rounded-[3px] ring-1 ring-inset ring-white/15 bg-[#2c3440] overflow-hidden flex items-center justify-center text-center text-xs text-[#678] px-3">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Prévia da capa" className="w-full h-full object-cover" />
                                ) : (
                                    <span>Sem capa</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="f_title" className={label}>Título</label>
                                <input type="text" id="f_title" required value={form.title}
                                    onChange={(event) => set("title", event.target.value)} className={field} />
                            </div>

                            <div>
                                <label htmlFor="f_director" className={label}>Diretor</label>
                                <input type="text" id="f_director" value={form.director}
                                    onChange={(event) => set("director", event.target.value)} className={field} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label htmlFor="f_year" className={label}>Ano</label>
                                    <input type="number" id="f_year" required min={1888} max={new Date().getFullYear()} step={1}
                                        value={form.year} onChange={(event) => set("year", event.target.value)}
                                        className={`${field} tabular-nums`} />
                                </div>

                                <div>
                                    <label htmlFor="f_duration" className={label}>Duração (min)</label>
                                    <input type="number" id="f_duration" required min={1} step={1}
                                        value={form.duration} onChange={(event) => set("duration", event.target.value)}
                                        className={`${field} tabular-nums`} />
                                </div>

                                <div>
                                    <label htmlFor="f_genre_id" className={label}>Gênero</label>
                                    <select id="f_genre_id" required value={form.genre_id}
                                        onChange={(event) => set("genre_id", event.target.value)} className={field}>
                                        <option value="">Selecione</option>
                                        {genres.map((genre) => (
                                            <option key={genre.id} value={genre.id}>
                                                {genre.name}{genre.active ? "" : " (inativo)"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="f_daily_price" className={label}>Diária (R$)</label>
                                    <input type="number" id="f_daily_price" required min={0} step={0.01}
                                        value={form.daily_price} onChange={(event) => set("daily_price", event.target.value)}
                                        className={`${field} tabular-nums`} />
                                </div>

                                <div>
                                    <label htmlFor="f_stock" className={label}>Estoque</label>
                                    <input type="number" id="f_stock" required min={0} step={1}
                                        value={form.stock} onChange={(event) => set("stock", event.target.value)}
                                        className={`${field} tabular-nums`} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="f_synopsis" className={label}>Sinopse</label>
                                <textarea id="f_synopsis" rows={5} value={form.synopsis}
                                    onChange={(event) => set("synopsis", event.target.value)}
                                    className={`${field} resize-y leading-relaxed`} />
                            </div>

                            <div>
                                <label htmlFor="f_cover" className={label}>Capa</label>
                                <input type="text" id="f_cover" value={form.cover} placeholder="https://..."
                                    onChange={(event) => set("cover", event.target.value)} className={field} />
                                <p className="text-xs text-[#678] mt-2">Link da imagem.</p>
                            </div>

                            {editing && (
                                <ActiveCheckbox
                                    checked={form.active}
                                    onChange={(active) => set("active", active)}
                                    help="Filmes inativos não aparecem no catálogo e não podem ser reservados."
                                />
                            )}

                            {error && <p className={fieldError}>{error}</p>}
                        </div>
                    </div>

                    <FormActions
                        cancelTo="/admin/movies"
                        submitLabel={editing ? "Salvar alterações" : "Salvar filme"}
                        sending={sending}
                    />
                </form>
            )}
        </FormPage>
    );
}
