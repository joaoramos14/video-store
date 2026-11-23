import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { errorMessage } from "../api/client";

interface LoadState<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
}

// Carrega os dados da página e recarrega a cada navegação (inclusive depois
// de uma ação que volta para a mesma página, como o "back()" do PHP).
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[] = []): LoadState<T> {
    const location = useLocation();
    const [state, setState] = useState<LoadState<T>>({ data: null, error: null, loading: true });

    useEffect(() => {
        let cancelled = false;

        setState((current) => ({ ...current, loading: true }));

        loader()
            .then((data) => {
                if (!cancelled) setState({ data, error: null, loading: false });
            })
            .catch((error: unknown) => {
                if (!cancelled) setState({ data: null, error: errorMessage(error), loading: false });
            });

        return () => {
            cancelled = true;
        };
    }, [location.key, ...deps]);

    return state;
}
