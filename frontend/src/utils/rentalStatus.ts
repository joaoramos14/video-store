import type { Rental } from "../api/types";

// Estado exibido: igual ao status gravado, menos "late", que é um aluguel
// em andamento com o prazo de devolução vencido (nunca gravado no banco).
export type DisplayStatus = "reserved" | "active" | "late" | "returned" | "cancelled" | "expired";

export function displayStatus(rental: Rental, now: Date = new Date()): DisplayStatus {
    if (rental.status === "active" && rental.due_at && new Date(rental.due_at) < now) {
        return "late";
    }

    return rental.status;
}

export function isClosedWithoutPickup(status: DisplayStatus): boolean {
    return status === "cancelled" || status === "expired";
}
