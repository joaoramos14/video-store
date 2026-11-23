const money = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateFormat = new Intl.DateTimeFormat("pt-BR");
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dayMonthFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

// R$ 1.234,56 (igual ao number_format do PHP).
export function formatMoney(value: number): string {
    return `R$ ${money.format(value)}`;
}

// 18/11/2026
export function formatDate(value: string | Date): string {
    return dateFormat.format(new Date(value));
}

// 14:30
export function formatTime(value: string | Date): string {
    return timeFormat.format(new Date(value));
}

// 18/11 14:30
export function formatDayMonthTime(value: string | Date): string {
    return `${dayMonthFormat.format(new Date(value))} ${formatTime(value)}`;
}

export function plural(count: number, singular: string, pluralForm: string): string {
    return count === 1 ? singular : pluralForm;
}
