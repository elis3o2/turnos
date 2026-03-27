import type { KeyNLabel } from "../types";

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface InitializeAuthData {
    access: string;
    refresh: string;
    username?: string;
    efectores?: KeyNLabel[];
}

export interface AuthContextType {
    authTokens: AuthTokens | null;
    initializeAuth: (data: InitializeAuthData) => void;

    username: string | null;
    efectores: KeyNLabel[];

    logout: () => void;
}