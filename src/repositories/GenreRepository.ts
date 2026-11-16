import supabase from "../config/supabase.js";
import { Genre } from "../model/Genre.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

async function findAll() {
    const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string): Promise<Genre> {
    const { data, error } = await supabase
        .from("genres")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Gênero não encontrado.");
    }

    return Genre.restore(
        data.id,
        data.name,
        data.active,
        data.description ?? undefined,
    );
}

async function findByName(name: string) {
    const { data, error } = await supabase
        .from("genres")
        .select("*")
        .ilike("name", name.replace(/[\\%_]/g, "\\$&"))
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function findMoviesByGenreId(genreId: string) {
    const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("genre_id", genreId)
        .order("title", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function searchByKeyword(keyword: string) {
    const { data, error } = await supabase
        .from("genres")
        .select("*")
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function create(genre: Genre) {
    const { data, error } = await supabase
        .from("genres")
        .insert({
            name: genre.getName(),
            description: genre.getDescription(),
            active: genre.isActive(),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(genre: Genre) {
    const id = genre.getId();

    if (!id) {
        throw new Error("Gênero sem ID não pode ser atualizado.");
    }

    const { data, error } = await supabase
        .from("genres")
        .update({
            name: genre.getName(),
            description: genre.getDescription(),
            active: genre.isActive(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Gênero não encontrado.");
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("genres")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === "23503") {
            throw new ValidationError("Não é possível remover um gênero que possui filmes.");
        }

        throw error;
    }

    if (!data) {
        throw new NotFoundError("Gênero não encontrado.");
    }

    return data;
}

export default {
    findAll,
    findById,
    findByName,
    findMoviesByGenreId,
    searchByKeyword,
    create,
    update,
    remove,
}
