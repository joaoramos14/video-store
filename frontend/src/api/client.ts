const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Erro com a mensagem que a API devolveu ({ message }), para mostrar ao usuário.
export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers: body === undefined ? undefined : { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError("Não foi possível conectar à API. Verifique se o back-end está rodando.", 0);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(data?.message ?? "Erro inesperado na API.", response.status);
    }

    return data as T;
}

export const api = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
};

export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Erro inesperado.";
}
