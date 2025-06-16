import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../stores/authStore";

export default function AuthLayout() {
  const { isAuthenticated }: any = useAuthStore();
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
