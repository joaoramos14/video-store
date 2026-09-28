import supabase from "../config/supabase.js";

async function findAll() {
    const { data, error } = await supabase
        .from("generos")
        .select("*")
        .order("nome", { ascending: true });

    if (error) throw error;
    return data;
}

async function findById(id: string) {
    const { data, error } = await supabase
        .from("generos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function create(genero: any) {
    const { data, error } = await supabase
        .from("generos")
        .insert(genero)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function update(id: string, genero: any) {
    const { data, error } = await supabase
        .from("generos")
        .update(genero)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("generos")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};