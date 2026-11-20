import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { customersApi } from "../api";
import type { Customer } from "../api/types";

// Dois perfis fixos, sem autenticação: Usuário (o cliente escolhido no cabeçalho) e Admin.
export type Profile = "user" | "admin";

const PROFILE_KEY = "7rent.profile";
const CUSTOMER_KEY = "7rent.customer";

interface ProfileContextValue {
    profile: Profile;
    isAdmin: boolean;
    toggle: () => void;
    // Clientes ativos que podem ser escolhidos e o cliente escolhido.
    customers: Customer[];
    customerId: string | undefined;
    chooseCustomer: (id: string) => void;
    reloadCustomers: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function save(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Sem localStorage a escolha só não fica salva entre as visitas.
    }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<Profile>(() => (read(PROFILE_KEY) === "admin" ? "admin" : "user"));
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerId, setCustomerId] = useState<string | undefined>(() => read(CUSTOMER_KEY) ?? undefined);

    // Carrega os clientes ativos; se o escolhido não existir mais, usa o primeiro da lista.
    const reloadCustomers = useCallback(() => {
        customersApi
            .list()
            .then((list) => {
                const active = list
                    .filter((customer) => customer.active)
                    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

                setCustomers(active);
                setCustomerId((current) =>
                    active.some((customer) => customer.id === current) ? current : active[0]?.id,
                );
            })
            .catch(() => setCustomers([]));
    }, []);

    useEffect(reloadCustomers, [reloadCustomers]);

    function toggle() {
        const next: Profile = profile === "admin" ? "user" : "admin";
        setProfile(next);
        save(PROFILE_KEY, next);
    }

    function chooseCustomer(id: string) {
        setCustomerId(id);
        save(CUSTOMER_KEY, id);
    }

    return (
        <ProfileContext.Provider
            value={{ profile, isAdmin: profile === "admin", toggle, customers, customerId, chooseCustomer, reloadCustomers }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile(): ProfileContextValue {
    const context = useContext(ProfileContext);

    if (!context) {
        throw new Error("useProfile precisa estar dentro de ProfileProvider.");
    }

    return context;
}
