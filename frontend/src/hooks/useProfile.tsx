import { createContext, useContext, useState, type ReactNode } from "react";

// Dois perfis fixos, sem autenticação: Usuário (o cliente de VITE_CUSTOMER_ID) e Admin.
export type Profile = "user" | "admin";

const STORAGE_KEY = "7rent.profile";

interface ProfileContextValue {
    profile: Profile;
    isAdmin: boolean;
    toggle: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function readProfile(): Profile {
    try {
        return localStorage.getItem(STORAGE_KEY) === "admin" ? "admin" : "user";
    } catch {
        return "user";
    }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<Profile>(readProfile);

    function toggle() {
        const next: Profile = profile === "admin" ? "user" : "admin";

        setProfile(next);

        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Sem localStorage o perfil só não fica salvo entre as visitas.
        }
    }

    return (
        <ProfileContext.Provider value={{ profile, isAdmin: profile === "admin", toggle }}>
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

// Cliente usado pelo perfil Usuário.
export const CUSTOMER_ID: string | undefined = import.meta.env.VITE_CUSTOMER_ID || undefined;
