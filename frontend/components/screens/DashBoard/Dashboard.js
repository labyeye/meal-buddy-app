import React from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Dashboard = ({ route, navigation }) => {
  const { userName = 'User' } = route.params || {};
  
  const getBackendUrl = () => {
    if (Platform.OS === 'ios') {
      return 'http://localhost:2000/api/auth/logout'; // iOS Backend URL
    } else {
      return 'http://10.0.2.2:2000/api/auth/logout'; // Android Emulator Backend URL
    }
  };
  
  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            onPress: async () => {
              const token = await AsyncStorage.getItem('userToken'); // Retrieve token
              const config = {
                headers: { Authorization: `Bearer ${token}` },
              };

              await axios.post(getBackendUrl(), {}, config);

              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userName');
              navigation.replace('Login');
            },
          },
        ],
        { cancelable: true },
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout.');
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {name}!</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard;
