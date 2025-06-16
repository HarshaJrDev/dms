import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Logout() {
    const { logout }: any = useAuthStore();
    useEffect(() => {
        logout();
        router.replace('/(auth)/login');
    }, []);
    return;
}