import LottieView from "lottie-react-native";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const Forgot = ({ navigation }) => {
  const { width, height } = useWindowDimensions();

  // Responsive sizes
  const lottieSize = height > 900 ? 300 : height < 700 ? 150 : 190;

  // Font size and input width based on screen width
  const fontSize = width > 400 ? 49 : 30;
  const inputWidth = width > 900 ? 50 : width > 380 ? 340 : 290;
  const inputheight = height > 900 ? 60 : height < 700 ? 60 : 60;
  const buttonWidth = width > 900 ? 450 : width > 380 ? 280 : 250;
  const buttonHeight = height > 900 ? 50 : height < 700 ? 40 : 50;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ width: "100%", marginTop: 30, paddingLeft: 20 }}>
        <Text style={[styles.name, { fontSize }]}>Welcome</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, { fontSize }]}>Get</Text>
          <Text style={[styles.nameShaala, { fontSize }]}>Started</Text>
        </View>
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
      />
      <TouchableOpacity
        style={[
          styles.button,
          { width: buttonWidth,height:buttonHeight }, // Adjust button width
        ]}
      >
        <Text style={{ color: "white" }}>Get OTP</Text>
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
  lottie: {
    marginTop: 20,
  },
  nameShaala: {
    color: "#FF6347", // Customize color for "Shaala"
    fontFamily: "Poppins-Regular",
    paddingLeft: 10,
  },
  phone: {
    backgroundColor: "white",
    marginTop: 30,
    padding: 15,
    borderRadius: 50,
  },
  password: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 15,
    borderRadius: 50,
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
  },
});

export default Forgot;
