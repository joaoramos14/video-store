import { describe, it, expect } from "vitest";
import { Customer } from "../model/Customer.js";

describe("Customer - Testes Unitários", () => {

    // Cliente com dados válidos
    it("deve criar um cliente válido", () => {

        const name = "Maria da Silva";
        const email = "maria@email.com";
        const cpf = "52998224725";
        const phone = "41999998888";

        const customer = new Customer(name, email, cpf, phone);

        expect(customer.getName()).toBe("Maria da Silva");
        expect(customer.getEmail()).toBe("maria@email.com");
        expect(customer.getCpf()).toBe("52998224725");
        expect(customer.getPhone()).toBe("41999998888");
        expect(customer.isActive()).toBe(true);
        expect(customer.getId()).toBeUndefined();
    });

    it("deve permitir criar um cliente sem telefone", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        expect(customer.getPhone()).toBeUndefined();
    });

    it("não deve permitir criar um cliente com nome vazio", () => {

        expect(() => {
            new Customer("", "maria@email.com", "52998224725");
        }).toThrow("O nome do cliente é obrigatório.");
    });

    it("não deve permitir criar um cliente com nome contendo apenas espaços", () => {

        const name = "     ";//trim()

        expect(() => {
            new Customer(name, "maria@email.com", "52998224725");
        }).toThrow("O nome do cliente é obrigatório.");
    });

    it("deve remover espaços antes e depois do nome do cliente", () => {

        const name = "  Maria da Silva   ";//trim()

        const customer = new Customer(name, "maria@email.com", "52998224725");

        expect(customer.getName()).toBe("Maria da Silva");
    });

    it("não deve permitir criar um cliente com e-mail sem arroba", () => {

        expect(() => {
            new Customer("Maria da Silva", "mariaemail.com", "52998224725");
        }).toThrow("O e-mail do cliente é inválido.");
    });

    it("não deve permitir criar um cliente com e-mail sem domínio", () => {

        expect(() => {
            new Customer("Maria da Silva", "maria@email", "52998224725");
        }).toThrow("O e-mail do cliente é inválido.");
    });

    it("não deve permitir criar um cliente com e-mail vazio", () => {

        expect(() => {
            new Customer("Maria da Silva", "", "52998224725");
        }).toThrow("O e-mail do cliente é inválido.");
    });

    it("deve guardar o e-mail em letras minúsculas e sem espaços nas pontas", () => {

        const customer = new Customer("Maria da Silva", "  Maria@Email.COM ", "52998224725");

        expect(customer.getEmail()).toBe("maria@email.com");
    });

    it("não deve permitir criar um cliente com CPF de tamanho inválido", () => {

        expect(() => {
            new Customer("Maria da Silva", "maria@email.com", "123");
        }).toThrow("O CPF do cliente é inválido.");
    });

    it("não deve permitir criar um cliente com CPF de dígitos repetidos", () => {

        expect(() => {
            new Customer("Maria da Silva", "maria@email.com", "11111111111");
        }).toThrow("O CPF do cliente é inválido.");
    });

    it("não deve permitir criar um cliente com CPF de dígitos verificadores inválidos", () => {

        expect(() => {
            new Customer("Maria da Silva", "maria@email.com", "52998224726");
        }).toThrow("O CPF do cliente é inválido.");
    });

    it("não deve permitir criar um cliente com primeiro dígito verificador do CPF inválido", () => {

        expect(() => {
            new Customer("Maria da Silva", "maria@email.com", "52998224715");
        }).toThrow("O CPF do cliente é inválido.");
    });

    it("não deve permitir criar um cliente com CPF que não seja texto", () => {

        const cpf = 52998224725 as unknown as string;

        expect(() => {
            new Customer("Maria da Silva", "maria@email.com", cpf);
        }).toThrow("O CPF do cliente é inválido.");
    });

    it("deve aceitar CPF com pontos e traço e guardar apenas os números", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "529.982.247-25");

        expect(customer.getCpf()).toBe("52998224725");
    });

    it("deve permitir renomear um cliente existente", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        customer.rename("Maria Souza");

        expect(customer.getName()).toBe("Maria Souza");
    });

    it("deve preservar o nome original após uma tentativa inválida de renomeação", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        expect(() => {
            customer.rename("");
        }).toThrow("O nome do cliente é obrigatório.");

        expect(customer.getName()).toBe("Maria da Silva");
    });

    it("deve permitir alterar o e-mail de um cliente", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        customer.changeEmail("maria.silva@email.com");

        expect(customer.getEmail()).toBe("maria.silva@email.com");
    });

    it("deve preservar o e-mail original após uma tentativa inválida de alteração", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        expect(() => {
            customer.changeEmail("invalido");
        }).toThrow("O e-mail do cliente é inválido.");

        expect(customer.getEmail()).toBe("maria@email.com");
    });

    it("deve permitir alterar o CPF de um cliente", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        customer.changeCpf("11144477735");

        expect(customer.getCpf()).toBe("11144477735");
    });

    it("deve permitir alterar o telefone de um cliente", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725", "41999998888");

        customer.changePhone("41988887777");

        expect(customer.getPhone()).toBe("41988887777");
    });

    it("deve permitir desativar e reativar um cliente", () => {

        const customer = new Customer("Maria da Silva", "maria@email.com", "52998224725");

        customer.deactivate();

        expect(customer.isActive()).toBe(false);

        customer.activate();

        expect(customer.isActive()).toBe(true);
    });

    it("deve restaurar um cliente existente", () => {

        const id = "bdf4183d-79a0-4f6f-8ead-03400eb6ed60";
        const name = "Maria da Silva";
        const email = "maria@email.com";
        const cpf = "52998224725";
        const active = false;
        const phone = "41999998888";

        const customer = Customer.restore(
            id,
            name,
            email,
            cpf,
            active,
            phone
        );

        expect(customer.getId()).toBe("bdf4183d-79a0-4f6f-8ead-03400eb6ed60");
        expect(customer.getName()).toBe("Maria da Silva");
        expect(customer.getEmail()).toBe("maria@email.com");
        expect(customer.getCpf()).toBe("52998224725");
        expect(customer.isActive()).toBe(false);
        expect(customer.getPhone()).toBe("41999998888");
    });
});
