import { Link, Outlet, useLocation } from "react-router";
import { currentFlash } from "../hooks/useFlash";
import { useProfile } from "../hooks/useProfile";

export function Layout() {
    const location = useLocation();
    const flash = currentFlash(location.state);
    const { isAdmin, toggle } = useProfile();

    return (
        <>
            {/* Header */}
            <header className="bg-[#14181c] border-b border-[#2c3440]">
                <div className="max-w-[950px] mx-auto px-4 h-[72px] flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-3 group">
                        {/* Três pontos: assinatura visual da marca */}
                        <span className="flex items-center -space-x-1" aria-hidden="true">
                            <span className="w-[18px] h-[18px] rounded-full bg-[#1f7fb8]"></span>
                            <span className="w-[18px] h-[18px] rounded-full bg-[#53c7ff]"></span>
                            <span className="w-[18px] h-[18px] rounded-full bg-[#b5e8ff]"></span>
                        </span>
                        <span className="text-white text-[22px] font-bold tracking-tight">7 Rent</span>
                    </Link>

                    <nav className="flex items-center gap-5 text-[12px] font-semibold uppercase tracking-[0.1em]">
                        <Link to="/" className="text-[#9ab] hover:text-white transition-colors">Catálogo</Link>
                        <Link to="/my-rentals" className="text-[#9ab] hover:text-white transition-colors">
                            Meus aluguéis
                        </Link>
                        {/* Troca de perfil: não há login, então Admin e Usuário são fixos */}
                        <button
                            type="button"
                            onClick={toggle}
                            aria-pressed={isAdmin}
                            className={`uppercase tracking-[0.1em] font-semibold transition-colors ${isAdmin ? "text-[#53c7ff] hover:text-[#8fdcff]" : "text-[#678] hover:text-white"}`}
                        >
                            Admin
                        </button>
                    </nav>
                </div>

                {isAdmin && (
                    // Subnavegação do administrador
                    <div className="bg-[#1b2229] border-t border-[#2c3440]">
                        <div className="max-w-[950px] mx-auto px-4 h-10 flex items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.1em]">
                            <span className="text-[#678]">Admin</span>
                            <Link to="/admin/genres" className="text-[#9ab] hover:text-[#53c7ff] transition-colors">Gêneros</Link>
                            <Link to="/admin/movies" className="text-[#9ab] hover:text-[#53c7ff] transition-colors">Filmes</Link>
                            <Link to="/admin/customers" className="text-[#9ab] hover:text-[#53c7ff] transition-colors">Clientes</Link>
                            <Link to="/admin/rentals" className="text-[#9ab] hover:text-[#53c7ff] transition-colors">Aluguéis</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Conteúdo */}
            <main className="max-w-[950px] mx-auto px-4 py-10 flex-grow w-full">
                {flash?.type === "status" && (
                    <div className="mb-6 px-4 py-3 bg-[#53c7ff]/10 border border-[#53c7ff]/40 text-[#b5e8ff] rounded-[3px] text-sm">
                        {flash.message}
                    </div>
                )}

                {flash?.type === "error" && (
                    <div className="mb-6 px-4 py-3 bg-[#ff5b5b]/10 border border-[#ff5b5b]/40 text-[#ffb3b3] rounded-[3px] text-sm">
                        {flash.message}
                    </div>
                )}

                <Outlet />
            </main>

            {/* Rodapé */}
            <footer className="border-t border-[#2c3440] text-[#678] text-xs py-8 mt-auto">
                <div className="max-w-[950px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} 7 Rent. Todos os direitos reservados.</p>
                </div>
            </footer>
        </>
    );
}
