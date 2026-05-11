import type { Efector } from "../../features/efector/types";

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface InitializeAuthData {
    access: string;
    refresh: string;
    username?: string;
    efectores?: Efector[];
    groups?: string;
}

export interface AuthContextType {
    authTokens: AuthTokens | null;
    initializeAuth: (data: InitializeAuthData) => void;
    isLoading: boolean;   
    username: string | null;
    efectores: Efector[];
    groups: string[];

    logout: () => void;
}