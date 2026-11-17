import { ValidationError } from "../errors/ValidantionError.js";

const MIN_YEAR = 1888;

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Movie {
    private id: string | undefined;
    private genreId: string;
    private title: string;
    private director: string | undefined;
    private synopsis: string | undefined;
    private year: number;
    private duration: number;
    private cover: string | undefined;
    private stock: number;
    private dailyPrice: number;
    private active: boolean;

    constructor(
        genreId: string,
        title: string,
        year: number,
        duration: number,
        dailyPrice: number,
        stock: number = 0,
        director?: string,
        synopsis?: string,
        cover?: string,
    ) {
        this.id = undefined;
        this.genreId = "";
        this.title = "";
        this.director = undefined;
        this.synopsis = undefined;
        this.year = 0;
        this.duration = 0;
        this.cover = undefined;
        this.stock = 0;
        this.dailyPrice = 0;
        this.active = true;

        this.changeGenre(genreId);
        this.rename(title);
        this.changeYear(year);
        this.changeDuration(duration);
        this.changeDailyPrice(dailyPrice);
        this.changeStock(stock);

        if (director !== undefined) {
            this.changeDirector(director);
        }

        if (synopsis !== undefined) {
            this.changeSynopsis(synopsis);
        }

        if (cover !== undefined) {
            this.changeCover(cover);
        }
    }

    static restore(
        id: string,
        genreId: string,
        title: string,
        year: number,
        duration: number,
        dailyPrice: number,
        stock: number,
        active: boolean,
        director?: string,
        synopsis?: string,
        cover?: string,
    ): Movie {
        const movie = new Movie(
            genreId,
            title,
            year,
            duration,
            dailyPrice,
            stock,
            director,
            synopsis,
            cover,
        );

        movie.id = id;
        movie.active = active;

        return movie;
    }

    getId(): string | undefined {
        return this.id;
    }

    getGenreId(): string {
        return this.genreId;
    }

    getTitle(): string {
        return this.title;
    }

    getDirector(): string | undefined {
        return this.director;
    }

    getSynopsis(): string | undefined {
        return this.synopsis;
    }

    getYear(): number {
        return this.year;
    }

    getDuration(): number {
        return this.duration;
    }

    getCover(): string | undefined {
        return this.cover;
    }

    getStock(): number {
        return this.stock;
    }

    getDailyPrice(): number {
        return this.dailyPrice;
    }

    isActive(): boolean {
        return this.active;
    }

    changeGenre(genreId: string): void {
        if (typeof genreId !== "string" || genreId.trim().length === 0) {
            throw new ValidationError("O gênero do filme é obrigatório.");
        }

        if (!UUID_REGEX.test(genreId.trim())) {
            throw new ValidationError(
                "O identificador do gênero deve ser um UUID válido.",
            );
        }

        this.genreId = genreId.trim();
    }

    rename(title: string): void {
        if (typeof title !== "string" || title.trim().length === 0) {
            throw new ValidationError("O título do filme é obrigatório.");
        }

        this.title = title.trim();
    }

    changeDirector(director: string): void {
        if (typeof director !== "string") {
            throw new ValidationError("O diretor do filme deve ser um texto.");
        }

        this.director = director.trim();
    }

    changeSynopsis(synopsis: string): void {
        if (typeof synopsis !== "string") {
            throw new ValidationError("A sinopse do filme deve ser um texto.");
        }

        this.synopsis = synopsis.trim();
    }

    changeYear(year: number): void {
        const currentYear = new Date().getFullYear();

        if (
            typeof year !== "number" ||
            !Number.isInteger(year) ||
            year < MIN_YEAR ||
            year > currentYear
        ) {
            throw new ValidationError(
                `O ano do filme deve ser um número inteiro entre ${MIN_YEAR} e ${currentYear}.`,
            );
        }

        this.year = year;
    }

    changeDuration(duration: number): void {
        if (
            typeof duration !== "number" ||
            !Number.isInteger(duration) ||
            duration < 1
        ) {
            throw new ValidationError(
                "A duração do filme deve ser um número inteiro maior ou igual a 1 minuto.",
            );
        }

        this.duration = duration;
    }

    changeCover(cover: string): void {
        if (typeof cover !== "string" || !Movie.isValidUrl(cover.trim())) {
            throw new ValidationError("A capa do filme deve ser uma URL válida.");
        }

        this.cover = cover.trim();
    }

    changeStock(stock: number): void {
        if (
            typeof stock !== "number" ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            throw new ValidationError(
                "O estoque do filme deve ser um número inteiro maior ou igual a zero.",
            );
        }

        this.stock = stock;
    }

    changeDailyPrice(dailyPrice: number): void {
        if (
            typeof dailyPrice !== "number" ||
            !Number.isFinite(dailyPrice) ||
            dailyPrice < 0
        ) {
            throw new ValidationError(
                "O valor da diária do filme deve ser um número maior ou igual a zero.",
            );
        }

        this.dailyPrice = dailyPrice;
    }

    activate(): void {
        this.active = true;
    }

    deactivate(): void {
        this.active = false;
    }

    private static isValidUrl(value: string): boolean {
        try {
            const url = new URL(value);

            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }
}
