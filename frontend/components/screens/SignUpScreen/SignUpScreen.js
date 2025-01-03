import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Alert
} from "react-native";
import axios from "axios";

const Signup = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        email,
        phoneNumber,
        password,
        confirmPassword,
      });
      console.log(res.data);
      // Handle the success, such as navigation or storing JWT token
      Alert.alert('Success', 'You have successfully signed up!');
      // Navigate to Login screen after successful signup
      navigation.navigate('Login');
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.msg || 'Server Error');
    }
  };

  const lottieSize = height > 900 ? 350 : (height < 700 ? 150 : 190); 
  const fontSize = width > 400 ? 49 : 30; 
  const inputWidth = width > 900 ? 350 : (width > 380 ? 290 : 260); 
  const inputheight = height > 900 ? 50 : (height < 700 ? 40 : 50); 
  const buttonWidth = width > 900 ? 350 : (width > 380 ? 180 : 150); 
  const buttonHeight = height > 900 ? 50 : (height < 700 ? 40 : 50); 

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ width: "100%", marginTop: 30, paddingLeft: 20, flexDirection: "row" }}>
        <Text style={[styles.name, { fontSize }]}>Sign</Text>
        <Text style={[styles.nameShaala, { fontSize }]}>Up</Text>
      </View>
      <LottieView
        style={[styles.lottie, { width: lottieSize, height: lottieSize }]}
        source={require("../../../src/assets/lottie/pizza.json")}
        autoPlay
        loop
      />
      <TextInput
        style={[styles.phone, { width: inputWidth, height: inputheight }]}
        placeholder="Enter Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        required
      />
      <TextInput
        style={[styles.password, { width: inputWidth, height: inputheight }]}
        placeholder="Enter Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        required
      />
      <TextInput
        style={[styles.password, { width: inputWidth, height: inputheight }]}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
        required
      />
      <TextInput
        style={[styles.password, { width: inputWidth, height: inputheight }]}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
        keyboardType="phone-pad"
        required
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, { width: buttonWidth, height: buttonHeight }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.forgotPassword}>Already a User? Login now</Text>
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
  name: {
    color: "white",
    fontFamily: "Poppins-Regular",
  },
  lottie: {
    marginTop: 10,
  },
  nameShaala: {
    color: "#FF6347",
    fontFamily: "Poppins-Regular",
  },
  phone: {
    height: 50,
    backgroundColor: "white",
    marginTop: 30,
    padding: 15,
    borderRadius: 50,
  },
  password: {
    height: 50,
    backgroundColor: "white",
    marginTop: 20,
    padding: 15,
    borderRadius: 50,
  },
  button: {
    height: 50,
    backgroundColor: "#FF6347",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  forgotPassword: {
    color: "white",
    marginTop: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default Signup;
