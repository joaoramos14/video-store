import { useLocation, useNavigate } from "react-router";

export interface Flash {
    type: "status" | "error";
    message: string;
}

// Mensagens de sucesso e erro mostradas no topo da página, como o
// session('status') e o session('error') do PHP.
export function useFlash() {
    const navigate = useNavigate();
    const location = useLocation();

    function show(flash: Flash, to?: string) {
        if (to) {
            navigate(to, { state: { flash } });
            return;
        }

        // Sem destino: volta para a própria página (o "back()" do PHP), que recarrega os dados.
        navigate(location.pathname + location.search, { replace: true, state: { flash } });
        window.scrollTo(0, 0);
    }

    return {
        status: (message: string, to?: string) => show({ type: "status", message }, to),
        error: (message: string, to?: string) => show({ type: "error", message }, to),
    };
}

export function currentFlash(state: unknown): Flash | null {
    if (state && typeof state === "object" && "flash" in state) {
        return (state as { flash: Flash }).flash;
    }

    return null;
}
