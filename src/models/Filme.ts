import supabase from "../config/supabase.js";

async function findAll() {
    const { data, error } = await supabase
        .from("filmes")
        .select("*");

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("filmes")
        .select("*")
        .eq("id", id)
        .maybeSingle()

    if (error) {
        throw error;
    }

    return data;
}

async function findByGeneroId(generoId: string) {
    const { data, error } = await supabase
        .from("filmes")
        .select("*")
        .eq("genero_id", generoId)
        .order("titulo", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function create(filme: {
    genero_id: string;
    titulo: string;
    descricao: string;
    ano_lancamento: number;
    diretor: string;
    preco_locacao: number;
    disponivel: boolean;
    ativo: boolean;
}) {
    const { data, error } = await supabase
        .from("filmes")
        .insert(filme)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(
    id: string,
    filme: {
        genero_id: string;
        titulo: string;
        descricao: string;
        ano_lancamento: number;
        diretor: string;
        preco_locacao: number;
        disponivel: boolean;
        ativo: boolean;
    }) {
    const { data, error } = await supabase
        .from("filmes")
        .update(filme)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("filmes")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export default {
    findAll,
    findById,
    findByGeneroId,
    create,
    update,
    remove
}
