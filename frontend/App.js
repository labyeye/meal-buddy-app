import React from "react";
import Home from "./components/screens/HomeScreen/Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./components/screens/LoginScreen/LoginScreen";
import Signup from "./components/screens/SignUpScreen/SignUpScreen";
import Forgot from "./components/screens/ForgotPassword/ForgotPassword";
import Dashboard from "./components/screens/DashBoard/Dashboard";

const Stack = createNativeStackNavigator();
const App = () => {
  return(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} options={{headerShown:false}}/>
          <Stack.Screen name="Login" component={Login} options={{headerShown:false}}/>
          <Stack.Screen name="SignUp" component={Signup} options={{headerShown:false}}/>
          <Stack.Screen name="Forgot" component={Forgot} options={{headerShown:false}}/>
          <Stack.Screen name="Dashboard" component={Dashboard} options={{headerShown:false}}/>
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default App;