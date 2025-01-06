import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import axios from "axios";

const Login = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

  // Responsive sizes
  const lottieSize = height > 900 ? 300 : height < 700 ? 150 : 190;
  const fontSize = width > 400 ? 49 : 30;
  const inputWidth = width > 900 ? 350 : width > 380 ? 340 : 290;
  const inputHeight = height > 900 ? 60 : 60;
  const buttonWidth = width > 900 ? 450 : width > 380 ? 280 : 250;
  const buttonHeight = height > 900 ? 50 : 50;

  // State management for inputs and feedback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle login logic
  const handleLogin = async () => {
    setLoading(true); // Start loader
    setErrorMessage(""); // Reset error message

    try {
      const response = await axios.post("http://localhost:2000/api/auth/login", { email, password });
      console.log("Login successful:", response.data);

      // Navigate to Dashboard or next screen
      navigation.navigate("Dashboard");
    } catch (err) {
      const error = err.response?.data?.message || "Something went wrong. Please try again.";
      setErrorMessage(error);
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Welcome Text */}
      <View style={{ width: "100%", marginTop: 30, paddingLeft: 20 }}>
        <Text style={[styles.name, { fontSize }]}>Welcome</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, { fontSize }]}>Get</Text>
          <Text style={[styles.nameShaala, { fontSize }]}>Started</Text>
        </View>
      </View>

      {/* Lottie Animation */}
      <LottieView
        style={[styles.lottie, { width: lottieSize, height: lottieSize }]}
        source={require("../../../src/assets/lottie/pizza.json")}
        autoPlay
        loop
      />

      {/* Email Input */}
      <TextInput
        style={[styles.input, { width: inputWidth, height: inputHeight }]}
        placeholder="Enter Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={[styles.input, { width: inputWidth, height: inputHeight }]}
        placeholder="Enter Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, { width: buttonWidth, height: buttonHeight }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 16 }}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Links for Forgot Password and Signup */}
      <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.linkText}>New User? Signup</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1c1c1c",
  },
  titleContainer: {
    flexDirection: "row",
  },
  name: {
    color: "white",
    fontFamily: "Poppins-Regular",
  },
  nameShaala: {
    color: "#FF6347",
    fontFamily: "Poppins-Regular",
    paddingLeft: 10,
  },
  lottie: {
    marginTop: 20,
  },
  input: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 15,
    borderRadius: 50,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF6347",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  linkText: {
    color: "white",
    marginTop: 20,
    fontSize: 14,
  },
  errorText: {
    color: "#FF6347",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Login;
