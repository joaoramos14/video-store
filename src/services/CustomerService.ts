import { Customer } from "../model/Customer.js";
import CustomerRepository from "../repositories/CustomerRepository.js";
import { ValidationError } from "../errors/ValidantionError.js";

interface UpdateCustomerData {
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
    active?: boolean;
}

async function getAll() {
    return CustomerRepository.findAll();
}

async function getById(id: string) {
    return CustomerRepository.findById(id);
}

async function search(keyword: string) {
    return CustomerRepository.searchByKeyword(keyword);
}

async function create(name: string, email: string, cpf: string, phone?: string) {
    const customer = new Customer(name, email, cpf, phone);

    const existingEmail = await CustomerRepository.findByEmail(customer.getEmail());

    if (existingEmail) {
        throw new ValidationError("Já existe um cliente com este e-mail.");
    }

    const existingCpf = await CustomerRepository.findByCpf(customer.getCpf());

    if (existingCpf) {
        throw new ValidationError("Já existe um cliente com este CPF.");
    }

    return CustomerRepository.create(customer);
}

async function update(id: string, data: UpdateCustomerData) {
    const customer = await CustomerRepository.findById(id);

    if (data.name !== undefined) {
        customer.rename(data.name);
    }

    if (data.email !== undefined) {
        customer.changeEmail(data.email);

        const existingEmail = await CustomerRepository.findByEmail(customer.getEmail());

        if (existingEmail && existingEmail.id !== id) {
            throw new ValidationError("Já existe um cliente com este e-mail.");
        }
    }

    if (data.cpf !== undefined) {
        customer.changeCpf(data.cpf);

        const existingCpf = await CustomerRepository.findByCpf(customer.getCpf());

        if (existingCpf && existingCpf.id !== id) {
            throw new ValidationError("Já existe um cliente com este CPF.");
        }
    }

    if (data.phone !== undefined) {
        customer.changePhone(data.phone);
    }

    if (data.active === true) {
        customer.activate();
    }

    if (data.active === false) {
        customer.deactivate();
    }

    return CustomerRepository.update(customer);
}

async function remove(id: string) {
    return CustomerRepository.remove(id);
}

export default {
    getAll,
    getById,
    search,
    create,
    update,
    remove,
}
