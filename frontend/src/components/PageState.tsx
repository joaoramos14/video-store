// Estados de carregamento e erro, no mesmo tom das mensagens vazias do PHP.

export function Loading() {
    return <div className="py-16 text-center text-sm text-[#678]">Carregando...</div>;
}

export function LoadError({ message }: { message: string }) {
    return (
        <div className="px-4 py-3 bg-[#ff5b5b]/10 border border-[#ff5b5b]/40 text-[#ffb3b3] rounded-[3px] text-sm">
            {message}
        </div>
    );
}

export function MissingCustomer() {
    return (
        <div className="px-4 py-3 bg-[#ff5b5b]/10 border border-[#ff5b5b]/40 text-[#ffb3b3] rounded-[3px] text-sm">
            Nenhum cliente configurado. Informe o ID de um cliente em <code>VITE_CUSTOMER_ID</code> no arquivo{" "}
            <code>frontend/.env</code> e reinicie o front-end.
        </div>
    );
}
