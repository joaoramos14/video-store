import type { DisplayStatus } from "../utils/rentalStatus";

// Selo do estado do aluguel (partials/rental-status do PHP).
const states: Record<DisplayStatus, [string, string]> = {
    reserved: ["Reservado", "border border-[#53c7ff]/50 text-[#53c7ff]"],
    active: ["Em andamento", "bg-[#53c7ff]/15 text-[#53c7ff]"],
    late: ["Atrasado", "bg-[#ff5b5b]/15 text-[#ff9b9b]"],
    returned: ["Devolvido", "bg-[#2c3440] text-[#9ab]"],
    cancelled: ["Cancelado", "bg-[#2c3440] text-[#678]"],
    expired: ["Expirado", "bg-[#2c3440] text-[#678]"],
};

export function RentalStatusBadge({ status }: { status: DisplayStatus }) {
    const [label, classes] = states[status];

    return (
        <span
            className={`inline-block text-[11px] font-semibold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[3px] whitespace-nowrap ${classes}`}
        >
            {label}
        </span>
    );
}
