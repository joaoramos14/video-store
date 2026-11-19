import supabase from "../config/supabase.js";
import { Rental } from "../model/Rental.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

const OPEN_STATUSES = ["reserved", "active"];

async function findAll() {
    const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string): Promise<Rental> {
    const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Locação não encontrada.");
    }

    return Rental.restore(
        data.id,
        data.customer_id,
        data.movie_id,
        data.days,
        Number(data.daily_price),
        Number(data.late_fee),
        data.status,
        new Date(data.reserved_until),
        data.rented_at ? new Date(data.rented_at) : undefined,
        data.due_at ? new Date(data.due_at) : undefined,
        data.returned_at ? new Date(data.returned_at) : undefined,
    );
}

async function findByCustomerId(customerId: string) {
    const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

async function findOpenByCustomerAndMovie(customerId: string, movieId: string) {
    const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("customer_id", customerId)
        .eq("movie_id", movieId)
        .in("status", OPEN_STATUSES);

    if (error) {
        throw error;
    }

    return data;
}

// Reservas cujo prazo de retirada já passou, mas que ainda não foram marcadas como expiradas.
async function findLapsedReservations() {
    const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("status", "reserved")
        .lte("reserved_until", new Date().toISOString());

    if (error) {
        throw error;
    }

    return data;
}

// Busca pelo estado exibido: só "active" e "late" olham o prazo de devolução;
// os outros usam o status gravado. O atraso (late) nunca é gravado no banco.
async function searchByKeyword(keyword: string) {
    const now = new Date().toISOString();

    let query = supabase.from("rentals").select("*");

    if (keyword === "active") {
        query = query.eq("status", "active").gte("due_at", now);
    } else if (keyword === "late") {
        query = query.eq("status", "active").lt("due_at", now);
    } else {
        query = query.eq("status", keyword);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

async function create(rental: Rental) {
    const { data, error } = await supabase
        .from("rentals")
        .insert({
            customer_id: rental.getCustomerId(),
            movie_id: rental.getMovieId(),
            days: rental.getDays(),
            daily_price: rental.getDailyPrice(),
            total_price: rental.getTotalPrice(),
            late_fee: rental.getLateFee(),
            status: rental.getStatus(),
            reserved_until: rental.getReservedUntil().toISOString(),
        })
        .select()
        .single();

    if (error) {
        if (error.code === "23503") {
            throw new ValidationError("O cliente ou o filme informado não existe.");
        }

        throw error;
    }

    return data;
}

async function update(rental: Rental) {
    const id = rental.getId();

    if (!id) {
        throw new Error("Locação sem ID não pode ser atualizada.");
    }

    const { data, error } = await supabase
        .from("rentals")
        .update({
            days: rental.getDays(),
            daily_price: rental.getDailyPrice(),
            total_price: rental.getTotalPrice(),
            late_fee: rental.getLateFee(),
            status: rental.getStatus(),
            reserved_until: rental.getReservedUntil().toISOString(),
            rented_at: rental.getRentedAt()?.toISOString() ?? null,
            due_at: rental.getDueAt()?.toISOString() ?? null,
            returned_at: rental.getReturnedAt()?.toISOString() ?? null,
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Locação não encontrada.");
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("rentals")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Locação não encontrada.");
    }

    return data;
}

export default {
    findAll,
    findById,
    findByCustomerId,
    findOpenByCustomerAndMovie,
    findLapsedReservations,
    searchByKeyword,
    create,
    update,
    remove,
};
