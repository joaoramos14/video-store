import { ValidationError } from "../errors/ValidantionError.js";

export class Customer {
    private id: string | undefined;
    private name: string;
    private email: string;
    private cpf: string;
    private phone: string | undefined;
    private active: boolean;


    constructor(name: string, email: string, cpf: string, phone?: string) {
        this.id = undefined;
        this.name = "";
        this.email = "";
        this.cpf = "";
        this.phone = phone;
        this.active = true;

        this.rename(name);
        this.changeEmail(email);
        this.changeCpf(cpf);
    }

    static restore(id: string, name: string, email: string, cpf: string, active: boolean, phone?: string): Customer {
        const customer = new Customer(name, email, cpf, phone);

        customer.id = id;
        customer.active = active;

        return customer;
    }


    getId(): string | undefined {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getEmail(): string {
        return this.email;
    }
    getCpf(): string {
        return this.cpf;
    }
    getPhone(): string | undefined {
        return this.phone;
    }
    isActive(): boolean {
        return this.active;
    }


    rename(name: string): void {
        if (typeof name !== "string" || name.trim().length === 0) {
            throw new ValidationError("O nome do cliente é obrigatório.");
        }

        this.name = name.trim();
    }

    changeEmail(email: string): void {
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new ValidationError("O e-mail do cliente é inválido.");
        }

        this.email = email.trim().toLowerCase();
    }

    changeCpf(cpf: string): void {
        if (typeof cpf !== "string" || !Customer.isValidCpf(cpf)) {
            throw new ValidationError("O CPF do cliente é inválido.");
        }

        this.cpf = cpf.replace(/\D/g, "");
    }

    changePhone(phone: string): void {
        this.phone = phone;
    }

    activate(): void {
        this.active = true;
    }
    deactivate(): void {
        this.active = false;
    }


    private static isValidCpf(cpf: string): boolean {
        const digits = cpf.replace(/\D/g, "");

        if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
            return false;
        }

        for (let length = 9; length <= 10; length++) {
            let sum = 0;

            for (let i = 0; i < length; i++) {
                sum += Number(digits[i]) * (length + 1 - i);
            }

            const checkDigit = ((sum * 10) % 11) % 10;

            if (checkDigit !== Number(digits[length])) {
                return false;
            }
        }

        return true;
    }

}
