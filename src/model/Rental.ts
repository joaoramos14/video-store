import { ValidationError } from "../errors/ValidantionError.js";

export type RentalStatus = "reserved" | "active" | "returned" | "cancelled" | "expired";

const MIN_DAYS = 1;
const MAX_DAYS = 30;
const RESERVATION_HOURS = 24;
const LATE_FEE_RATE = 1.5;

const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Rental {
    private id: string | undefined;
    private customerId: string;
    private movieId: string;
    private days: number;
    private dailyPrice: number;
    private totalPrice: number;
    private lateFee: number;
    private status: RentalStatus;
    private reservedUntil: Date;
    private rentedAt: Date | undefined;
    private dueAt: Date | undefined;
    private returnedAt: Date | undefined;

    constructor(
        customerId: string,
        movieId: string,
        days: number,
        dailyPrice: number = 0,
        now: Date = new Date(),
    ) {
        this.id = undefined;
        this.customerId = "";
        this.movieId = "";
        this.days = 0;
        this.dailyPrice = 0;
        this.totalPrice = 0;
        this.lateFee = 0;
        this.status = "reserved";
        this.reservedUntil = new Date(now.getTime() + RESERVATION_HOURS * HOUR_IN_MS);
        this.rentedAt = undefined;
        this.dueAt = undefined;
        this.returnedAt = undefined;

        this.changeCustomer(customerId);
        this.changeMovie(movieId);
        this.changeDays(days);
        this.changeDailyPrice(dailyPrice);
    }

    static restore(
        id: string,
        customerId: string,
        movieId: string,
        days: number,
        dailyPrice: number,
        lateFee: number,
        status: RentalStatus,
        reservedUntil: Date,
        rentedAt?: Date,
        dueAt?: Date,
        returnedAt?: Date,
    ): Rental {
        const rental = new Rental(customerId, movieId, days, dailyPrice);

        rental.id = id;
        rental.lateFee = lateFee;
        rental.status = status;
        rental.reservedUntil = reservedUntil;
        rental.rentedAt = rentedAt;
        rental.dueAt = dueAt;
        rental.returnedAt = returnedAt;

        return rental;
    }

    getId(): string | undefined {
        return this.id;
    }

    getCustomerId(): string {
        return this.customerId;
    }

    getMovieId(): string {
        return this.movieId;
    }

    getDays(): number {
        return this.days;
    }

    getDailyPrice(): number {
        return this.dailyPrice;
    }

    getTotalPrice(): number {
        return this.totalPrice;
    }

    getLateFee(): number {
        return this.lateFee;
    }

    getStatus(): RentalStatus {
        return this.status;
    }

    getReservedUntil(): Date {
        return this.reservedUntil;
    }

    getRentedAt(): Date | undefined {
        return this.rentedAt;
    }

    getDueAt(): Date | undefined {
        return this.dueAt;
    }

    getReturnedAt(): Date | undefined {
        return this.returnedAt;
    }

    isReserved(): boolean {
        return this.status === "reserved";
    }

    // Reserva ainda dentro do prazo de retirada.
    isPickupOpen(now: Date = new Date()): boolean {
        return this.isReserved() && this.reservedUntil.getTime() > now.getTime();
    }

    // O filme está com o cliente (retirado e ainda não devolvido).
    isOut(): boolean {
        return this.status === "active";
    }

    // Reserva em aberto ou filme com o cliente: impede nova reserva do mesmo filme e a exclusão.
    isOpen(): boolean {
        return this.isReserved() || this.isOut();
    }

    changeCustomer(customerId: string): void {
        if (typeof customerId !== "string" || customerId.trim().length === 0) {
            throw new ValidationError("O cliente da locação é obrigatório.");
        }

        if (!UUID_REGEX.test(customerId.trim())) {
            throw new ValidationError(
                "O identificador do cliente deve ser um UUID válido.",
            );
        }

        this.customerId = customerId.trim();
    }

    changeMovie(movieId: string): void {
        if (typeof movieId !== "string" || movieId.trim().length === 0) {
            throw new ValidationError("O filme da locação é obrigatório.");
        }

        if (!UUID_REGEX.test(movieId.trim())) {
            throw new ValidationError(
                "O identificador do filme deve ser um UUID válido.",
            );
        }

        this.movieId = movieId.trim();
    }

    changeDays(days: number): void {
        if (!this.isReserved()) {
            throw new ValidationError(
                "Só é possível alterar os dias de uma reserva que ainda não foi retirada.",
            );
        }

        if (
            typeof days !== "number" ||
            !Number.isInteger(days) ||
            days < MIN_DAYS ||
            days > MAX_DAYS
        ) {
            throw new ValidationError(
                `A quantidade de dias da locação deve ser um número inteiro entre ${MIN_DAYS} e ${MAX_DAYS}.`,
            );
        }

        this.days = days;
        this.calculateTotalPrice();
    }

    changeDailyPrice(dailyPrice: number): void {
        if (!this.isReserved()) {
            throw new ValidationError(
                "Só é possível alterar a diária de uma reserva que ainda não foi retirada.",
            );
        }

        if (
            typeof dailyPrice !== "number" ||
            !Number.isFinite(dailyPrice) ||
            dailyPrice < 0
        ) {
            throw new ValidationError(
                "O valor da diária da locação deve ser um número maior ou igual a zero.",
            );
        }

        this.dailyPrice = dailyPrice;
        this.calculateTotalPrice();
    }

    pickUp(now: Date = new Date()): void {
        if (this.status === "cancelled") {
            throw new ValidationError("Esta reserva foi cancelada.");
        }

        if (this.status === "expired") {
            throw new ValidationError("Esta reserva expirou.");
        }

        if (!this.isReserved()) {
            throw new ValidationError("Este filme já foi retirado.");
        }

        // Fora do prazo só recusa; quem expira a reserva e devolve a cópia é a rotina de expiração.
        if (!this.isPickupOpen(now)) {
            throw new ValidationError("O prazo de retirada desta reserva terminou.");
        }

        this.status = "active";
        this.rentedAt = now;
        this.dueAt = new Date(now.getTime() + this.days * DAY_IN_MS);
    }

    returnMovie(now: Date = new Date()): void {
        if (this.status === "returned") {
            throw new ValidationError("Este filme já foi devolvido.");
        }

        if (!this.isOut()) {
            throw new ValidationError(
                this.isReserved()
                    ? "Este filme ainda não foi retirado. Confirme a retirada antes de registrar a devolução."
                    : "Este aluguel foi encerrado sem retirada.",
            );
        }

        this.lateFee = this.calculateLateFee(now);
        this.returnedAt = now;
        this.status = "returned";
    }

    cancel(): void {
        if (!this.isReserved()) {
            throw new ValidationError(
                "Só é possível cancelar uma reserva que ainda não foi retirada.",
            );
        }

        this.status = "cancelled";
    }

    expire(): void {
        if (!this.isReserved()) {
            throw new ValidationError("Só é possível expirar uma reserva que ainda não foi retirada.");
        }

        this.status = "expired";
    }

    // Multa de 1,5 × a diária por dia (ou fração de dia) de atraso.
    calculateLateFee(now: Date = new Date()): number {
        if (!this.dueAt || now.getTime() <= this.dueAt.getTime()) {
            return 0;
        }

        const lateDays = Math.ceil((now.getTime() - this.dueAt.getTime()) / DAY_IN_MS);

        return Rental.roundPrice(lateDays * this.dailyPrice * LATE_FEE_RATE);
    }

    private calculateTotalPrice(): void {
        this.totalPrice = Rental.roundPrice(this.dailyPrice * this.days);
    }

    private static roundPrice(value: number): number {
        return Math.round(value * 100) / 100;
    }
}
