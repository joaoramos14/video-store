import { ValidationError } from "../errors/ValidantionError.js";

export class Genre {
    private id: string | undefined;
    private name: string;
    private description: string | undefined;
    private active: boolean;


    constructor(name: string, description?: string) {
        this.id = undefined;
        this.name = "";
        this.description = description;
        this.active = true;

        this.rename(name);
    }

    static restore(id: string, name: string, active: boolean, description?: string): Genre {
        const genre = new Genre(name, description);

        genre.id = id;
        genre.active = active;

        return genre;
    }


    getId(): string | undefined {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getDescription(): string | undefined {
        return this.description;
    }
    isActive(): boolean {
        return this.active;
    }


    rename(name: string): void {
        if (typeof name !== "string" || name.trim().length === 0) {
            throw new ValidationError("O nome do gênero é obrigatório.");
        }

        this.name = name.trim();
    }


    changeDescription(description: string): void {
        this.description = description;
    }

    activate(): void {
        this.active = true;
    }
    deactivate(): void {
        this.active = false;
    }

}
