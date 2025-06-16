import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { login } from "../services/authSevice";
import { useAuthStore } from "../stores/authStore";

const DEFAULT_EMAIL = "Harsha10@gmail.com";
const DEFAULT_PASSWORD = "Harsha10@gmail.com";

export default function LoginScreen() {
  const navigation = useNavigation();
  const setUser = useAuthStore((state) => state.setUser);
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      login(data.email, data.password),
    onSuccess: async (res) => {
      const data = res?.data || res;

      const mainData = {
        id: data.driverDetails?.id,
        name: data.driverDetails?.fullName,
        email: data.driverDetails?.email,
        phone: data.driverDetails?.phone,
        profilePicture: data.driverDetails?.profilepicture,
        storeName: data.driverDetails?.Store?.name,
        storeAddress: data.driverDetails?.Store?.address,
        token: data.token,
        role: data.role,
      };

      console.log("✅ Main Login Data:", mainData);

      setUser(mainData, mainData.token);
      await AsyncStorage.setItem("user", JSON.stringify(mainData));
      await AsyncStorage.setItem("token", mainData.token);

      const storedUser = await AsyncStorage.getItem("user");
      console.log("📦 Stored AsyncStorage User:", JSON.parse(storedUser || "{}"));

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    },
    onError: (error) => {
      console.log("❌ Login Failed:", error);
      Alert.alert("Login Error", "Invalid email or password.");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Validation", "Please enter email and password.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/login-illustration.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Login</Text>
          <Text style={styles.formSubtitle}>Please sign in to continue</Text>
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#BDBDBD" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#BDBDBD" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#BDBDBD"
            />
          </TouchableOpacity>
        </View>

        {/* Remember Me */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <MaterialIcons name="check" size={16} color="#4A6FE3" />
              )}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  imageContainer: { height: "40%", position: "relative" },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(74, 111, 227, 0.5)",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  formHeader: { marginBottom: 30 },
  formTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 8 },
  formSubtitle: { fontSize: 14, color: "#757575" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  eyeIcon: { padding: 8 },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  rememberContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4A6FE3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  rememberText: { fontSize: 14, color: "#757575" },
  loginButton: {
    backgroundColor: "#4A6FE3",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A6FE3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
