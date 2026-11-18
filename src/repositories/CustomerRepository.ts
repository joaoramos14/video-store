import supabase from "../config/supabase.js";
import { Customer } from "../model/Customer.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidantionError.js";

async function findAll() {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function findById(id: string): Promise<Customer> {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Cliente não encontrado.");
    }

    return Customer.restore(
        data.id,
        data.name,
        data.email,
        data.cpf,
        data.active,
        data.phone ?? undefined,
    );
}

async function findByEmail(email: string) {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function findByCpf(cpf: string) {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("cpf", cpf)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function searchByKeyword(keyword: string) {
    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%,cpf.ilike.%${keyword}%`)
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
}

async function create(customer: Customer) {
    const { data, error } = await supabase
        .from("customers")
        .insert({
            name: customer.getName(),
            email: customer.getEmail(),
            cpf: customer.getCpf(),
            phone: customer.getPhone(),
            active: customer.isActive(),
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

async function update(customer: Customer) {
    const id = customer.getId();

    if (!id) {
        throw new Error("Cliente sem ID não pode ser atualizado.");
    }

    const { data, error } = await supabase
        .from("customers")
        .update({
            name: customer.getName(),
            email: customer.getEmail(),
            cpf: customer.getCpf(),
            phone: customer.getPhone(),
            active: customer.isActive(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new NotFoundError("Cliente não encontrado.");
    }

    return data;
}

async function remove(id: string) {
    const { data, error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === "23503") {
            throw new ValidationError("Não é possível remover um cliente que possui locações.");
        }

        throw error;
    }

    if (!data) {
        throw new NotFoundError("Cliente não encontrado.");
    }

    return data;
}

export default {
    findAll,
    findById,
    findByEmail,
    findByCpf,
    searchByKeyword,
    create,
    update,
    remove,
}
