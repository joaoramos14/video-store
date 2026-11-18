import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomerService from "../services/CustomerService.js";
import CustomerRepository from "../repositories/CustomerRepository.js";
import { Customer } from "../model/Customer.js";
import { NotFoundError } from "../errors/NotFoundError.js";

vi.mock("../repositories/CustomerRepository.js");

describe("CustomerService - Testes Unitários", () => {

    const id = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";
    const cpf = "52998224725";

    function makeCustomer() {
        return Customer.restore(id, "Maria da Silva", "maria@email.com", cpf, true, "41999998888");
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve criar um cliente quando e-mail e CPF ainda não existem", async () => {
        vi.mocked(CustomerRepository.findByEmail).mockResolvedValue(null);
        vi.mocked(CustomerRepository.findByCpf).mockResolvedValue(null);
        vi.mocked(CustomerRepository.create).mockResolvedValue({ id, name: "Maria da Silva" });

        const result = await CustomerService.create("Maria da Silva", "Maria@Email.com", "529.982.247-25");

        expect(CustomerRepository.findByEmail).toHaveBeenCalledWith("maria@email.com");
        expect(CustomerRepository.findByCpf).toHaveBeenCalledWith(cpf);
        expect(CustomerRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id, name: "Maria da Silva" });
    });

    it("não deve permitir criar um cliente com e-mail repetido", async () => {
        vi.mocked(CustomerRepository.findByEmail).mockResolvedValue({ id: "1", email: "maria@email.com" });

        await expect(CustomerService.create("Maria da Silva", "maria@email.com", cpf))
            .rejects.toThrow("Já existe um cliente com este e-mail.");

        expect(CustomerRepository.create).not.toHaveBeenCalled();
    });

    it("não deve permitir criar um cliente com CPF repetido", async () => {
        vi.mocked(CustomerRepository.findByEmail).mockResolvedValue(null);
        vi.mocked(CustomerRepository.findByCpf).mockResolvedValue({ id: "1", cpf });

        await expect(CustomerService.create("Maria da Silva", "maria@email.com", cpf))
            .rejects.toThrow("Já existe um cliente com este CPF.");

        expect(CustomerRepository.create).not.toHaveBeenCalled();
    });

    it("não deve consultar o banco ao criar um cliente com CPF inválido", async () => {
        await expect(CustomerService.create("Maria da Silva", "maria@email.com", "11111111111"))
            .rejects.toThrow("O CPF do cliente é inválido.");

        expect(CustomerRepository.findByEmail).not.toHaveBeenCalled();
        expect(CustomerRepository.findByCpf).not.toHaveBeenCalled();
        expect(CustomerRepository.create).not.toHaveBeenCalled();
    });

    it("deve atualizar os dados de um cliente", async () => {
        const customer = makeCustomer();
        vi.mocked(CustomerRepository.findById).mockResolvedValue(customer);
        vi.mocked(CustomerRepository.findByEmail).mockResolvedValue(null);
        vi.mocked(CustomerRepository.findByCpf).mockResolvedValue(null);
        vi.mocked(CustomerRepository.update).mockResolvedValue({ id, name: "Maria Souza" });

        const result = await CustomerService.update(id, {
            name: "Maria Souza",
            email: "maria.souza@email.com",
            cpf: "11144477735",
            phone: "41988887777",
        });

        expect(customer.getName()).toBe("Maria Souza");
        expect(customer.getEmail()).toBe("maria.souza@email.com");
        expect(customer.getCpf()).toBe("11144477735");
        expect(customer.getPhone()).toBe("41988887777");
        expect(CustomerRepository.update).toHaveBeenCalledWith(customer);
        expect(result).toEqual({ id, name: "Maria Souza" });
    });

    it("deve permitir manter o e-mail e o CPF do próprio cliente ao atualizar", async () => {
        const customer = makeCustomer();
        vi.mocked(CustomerRepository.findById).mockResolvedValue(customer);
        vi.mocked(CustomerRepository.findByEmail).mockResolvedValue({ id, email: "maria@email.com" });
        vi.mocked(CustomerRepository.findByCpf).mockResolvedValue({ id, cpf });
        vi.mocked(CustomerRepository.update).mockResolvedValue({ id });

        await CustomerService.update(id, { email: "maria@email.com", cpf });

        expect(CustomerRepository.update).toHaveBeenCalledTimes(1);
    });

    it("não deve permitir alterar o e-mail para um e-mail que já existe", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(CustomerRepository.findByEmail).mockResolvedValue({ id: "outro-id", email: "joao@email.com" });

        await expect(CustomerService.update(id, { email: "joao@email.com" }))
            .rejects.toThrow("Já existe um cliente com este e-mail.");

        expect(CustomerRepository.update).not.toHaveBeenCalled();
    });

    it("não deve permitir alterar o CPF para um CPF que já existe", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(CustomerRepository.findByCpf).mockResolvedValue({ id: "outro-id", cpf: "11144477735" });

        await expect(CustomerService.update(id, { cpf: "11144477735" }))
            .rejects.toThrow("Já existe um cliente com este CPF.");

        expect(CustomerRepository.update).not.toHaveBeenCalled();
    });

    it("não deve buscar e-mail ou CPF repetidos quando eles não são alterados", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());
        vi.mocked(CustomerRepository.update).mockResolvedValue({ id });

        await CustomerService.update(id, { name: "Maria Souza" });

        expect(CustomerRepository.findByEmail).not.toHaveBeenCalled();
        expect(CustomerRepository.findByCpf).not.toHaveBeenCalled();
        expect(CustomerRepository.update).toHaveBeenCalledTimes(1);
    });

    it("deve desativar e reativar um cliente", async () => {
        const customer = makeCustomer();
        vi.mocked(CustomerRepository.findById).mockResolvedValue(customer);
        vi.mocked(CustomerRepository.update).mockResolvedValue({ id });

        await CustomerService.update(id, { active: false });

        expect(customer.isActive()).toBe(false);

        await CustomerService.update(id, { active: true });

        expect(customer.isActive()).toBe(true);
    });

    it("não deve atualizar um cliente que não existe", async () => {
        vi.mocked(CustomerRepository.findById).mockRejectedValue(new NotFoundError("Cliente não encontrado."));

        await expect(CustomerService.update(id, { name: "Maria Souza" }))
            .rejects.toThrow("Cliente não encontrado.");

        expect(CustomerRepository.update).not.toHaveBeenCalled();
    });

    it("deve listar os clientes", async () => {
        vi.mocked(CustomerRepository.findAll).mockResolvedValue([{ id, name: "Maria da Silva" }]);

        const result = await CustomerService.getAll();

        expect(result).toEqual([{ id, name: "Maria da Silva" }]);
    });

    it("deve buscar um cliente pelo id", async () => {
        vi.mocked(CustomerRepository.findById).mockResolvedValue(makeCustomer());

        const result = await CustomerService.getById(id);

        expect(CustomerRepository.findById).toHaveBeenCalledWith(id);
        expect(result.getName()).toBe("Maria da Silva");
    });

    it("deve buscar clientes por palavra-chave", async () => {
        vi.mocked(CustomerRepository.searchByKeyword).mockResolvedValue([{ id, name: "Maria da Silva" }]);

        const result = await CustomerService.search("maria");

        expect(CustomerRepository.searchByKeyword).toHaveBeenCalledWith("maria");
        expect(result).toEqual([{ id, name: "Maria da Silva" }]);
    });

    it("deve remover um cliente", async () => {
        vi.mocked(CustomerRepository.remove).mockResolvedValue({ id, name: "Maria da Silva" });

        const result = await CustomerService.remove(id);

        expect(CustomerRepository.remove).toHaveBeenCalledWith(id);
        expect(result).toEqual({ id, name: "Maria da Silva" });
    });
});
