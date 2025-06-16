import apiClient from "./apiClient";

export const login = (email: string, password: string) => { 
    return apiClient.post("/auth/login", { email, password });
};
