import { useEffect } from "react";

// Título da aba, no formato do PHP: "Catálogo - 7 Rent".
export function useTitle(title: string) {
    useEffect(() => {
        document.title = `${title} - 7 Rent`;
    }, [title]);
}
