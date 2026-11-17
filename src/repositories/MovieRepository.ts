import supabase from "../config/supabase.js";
import { Movie } from "../model/Movie.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

async function findAll() {
    const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("title", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string): Promise<Movie> {
    const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Filme não encontrado.");
    }

    return Movie.restore(
        data.id,
        data.genre_id,
        data.title,
        data.year,
        data.duration,
        Number(data.daily_price),
        data.stock,
        data.active,
        data.director ?? undefined,
        data.synopsis ?? undefined,
        data.cover ?? undefined,
    );
}

async function searchByKeyword(keyword: string) {
    const { data, error } = await supabase
        .from("movies")
        .select("*")
        .or(
            `title.ilike.%${keyword}%,director.ilike.%${keyword}%,synopsis.ilike.%${keyword}%`,
        )
        .order("title", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function create(movie: Movie) {
    const { data, error } = await supabase
        .from("movies")
        .insert({
            genre_id: movie.getGenreId(),
            title: movie.getTitle(),
            director: movie.getDirector(),
            synopsis: movie.getSynopsis(),
            year: movie.getYear(),
            duration: movie.getDuration(),
            cover: movie.getCover(),
            stock: movie.getStock(),
            daily_price: movie.getDailyPrice(),
            active: movie.isActive(),
        })
        .select()
        .single();

    if (error) {
        if (error.code === "23503") {
            throw new ValidationError("O gênero informado não existe.");
        }

        throw error;
    }

    return data;
}

async function update(movie: Movie) {
    const id = movie.getId();

    if (!id) {
        throw new Error("Filme sem ID não pode ser atualizado.");
    }

    const { data, error } = await supabase
        .from("movies")
        .update({
            genre_id: movie.getGenreId(),
            title: movie.getTitle(),
            director: movie.getDirector(),
            synopsis: movie.getSynopsis(),
            year: movie.getYear(),
            duration: movie.getDuration(),
            cover: movie.getCover(),
            stock: movie.getStock(),
            daily_price: movie.getDailyPrice(),
            active: movie.isActive(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === "23503") {
            throw new ValidationError("O gênero informado não existe.");
        }

        throw error;
    }

    if (!data) {
        throw new NotFoundError("Filme não encontrado.");
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("movies")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === "23503") {
            throw new ValidationError(
                "O filme não pode ser excluído pois possui locações associadas.",
            );
        }

        throw error;
    }

    if (!data) {
        throw new NotFoundError("Filme não encontrado.");
    }

    return data;
}

export default {
    findAll,
    findById,
    searchByKeyword,
    create,
    update,
    remove,
};
