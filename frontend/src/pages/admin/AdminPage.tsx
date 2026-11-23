import type { ReactNode } from "react";
import { Link, Navigate } from "react-router";
import { useProfile } from "../../hooks/useProfile";
import { backLink, panel, primaryButton, sectionTitle } from "../../components/ui";

// As telas de admin só aparecem no perfil Admin.
export function AdminOnly({ children }: { children: ReactNode }) {
    const { isAdmin } = useProfile();
    return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
}

interface ListHeaderProps {
    title: string;
    description: string;
    newLabel: string;
    newTo: string;
}

// Cabeçalho das listas do admin, com o botão de cadastro à direita.
export function ListHeader({ title, description, newLabel, newTo }: ListHeaderProps) {
    return (
        <div className="flex items-end justify-between gap-4 mb-8">
            <div>
                <h1 className="text-white text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-sm text-[#678] mt-1">{description}</p>
            </div>
            <Link
                to={newTo}
                className="shrink-0 px-4 py-2 bg-[#53c7ff] hover:bg-[#8fdcff] text-[#14181c] text-xs font-bold uppercase tracking-[0.1em] rounded-[3px] transition-colors"
            >
                {newLabel}
            </Link>
        </div>
    );
}

interface FormPageProps {
    width: string;
    backTo: string;
    backLabel: string;
    title: string;
    description: string;
    section: string;
    children: ReactNode;
}

// Moldura dos formulários de criar e editar.
export function FormPage({ width, backTo, backLabel, title, description, section, children }: FormPageProps) {
    return (
        <div className={`${width} mx-auto`}>
            <div className="mb-8">
                <Link to={backTo} className={backLink}>&larr; {backLabel}</Link>
                <h1 className="text-white text-3xl font-bold tracking-tight mt-2">{title}</h1>
                <p className="text-sm text-[#678] mt-1">{description}</p>
            </div>

            <h2 className={sectionTitle}>{section}</h2>

            <div className={`${panel} p-6`}>{children}</div>
        </div>
    );
}

// Selo "Inativo" ao lado do nome nas listas.
export function InactiveBadge() {
    return (
        <span className="ml-2 align-middle inline-block text-[10px] font-semibold uppercase tracking-[0.1em] bg-[#2c3440] text-[#678] px-2 py-0.5 rounded-[3px]">
            Inativo
        </span>
    );
}

// Linha de rodapé dos formulários com Cancelar e Salvar.
export function FormActions({ cancelTo, submitLabel, sending }: { cancelTo: string; submitLabel: string; sending: boolean }) {
    return (
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#2c3440]">
            <Link to={cancelTo} className="px-4 py-2 bg-[#456] hover:bg-[#567] text-white text-xs font-bold uppercase tracking-[0.1em] rounded-[3px] transition-colors">
                Cancelar
            </Link>
            <button type="submit" disabled={sending} className={primaryButton}>
                {submitLabel}
            </button>
        </div>
    );
}

// Caixa "Ativo" dos formulários de edição.
export function ActiveCheckbox({ checked, onChange, help }: { checked: boolean; onChange: (value: boolean) => void; help: string }) {
    return (
        <div>
            <label className="flex items-center gap-3 text-sm text-white cursor-pointer w-fit">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    className="w-4 h-4 accent-[#53c7ff]"
                />
                Ativo
            </label>
            <p className="text-xs text-[#678] mt-2">{help}</p>
        </div>
    );
}
