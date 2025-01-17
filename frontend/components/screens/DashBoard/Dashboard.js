import React from 'react';
import jwtDecode from 'jwt-decode'; // Ensure this is the default import
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import IonIcons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {TextInput} from 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler'; // Import GestureHandlerRootView

const Dashboard = ({route, navigation}) => {
  const {width} = useWindowDimensions();
  const {name = 'User'} = route.params || {};

  // Header and font size
  const headerWidth = width > 400 ? 410 : width > 380 ? 350 : 335;
  const headerHeight = width > 400 ? 140 : width > 380 ? 120 : 100;
  const headerBWidth = width > 400 ? 85 : width > 380 ? 85 : 80;
  const headerBHeight = width > 400 ? 90 : width > 380 ? 90 : 85;
  const fontSize = width > 400 ? 39 : 30;

  // Icon and image sizes
  const iconSize = width > 400 ? 30 : width > 380 ? 25 : 20;
  const imageSize = width > 400 ? 55 : width > 380 ? 45 : 35;

  const getBackendUrl = () => {
    if (Platform.OS === 'ios') {
      return 'http://localhost:2000/api/auth/logout';
    } else {
      return 'http://10.0.2.2:2000/api/auth/logout';
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Logout',
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                  const decodedToken = jwtDecode(token);
                  const config = {
                    headers: {Authorization: `Bearer ${token}`},
                  };

                  // Inform the backend about logout
                  await axios.post(getBackendUrl(), {}, config);
                }
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userName');

                navigation.replace('Login');
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert(
                  'Error',
                  'Failed to contact the server, but you have been logged out.',
                );
                navigation.replace('Login'); // Handle fallback navigation
              }
            },
          },
        ],
        {cancelable: true},
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Something went wrong during logout.');
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topContainer}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              backgroundColor: 'white',
              borderRadius: 10,
            }}>
            <Image
              source={require('../../../src/assets/images/male.png')}
              style={[styles.image, {width: imageSize, height: imageSize}]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.notificationIcon,
              {width: imageSize, height: imageSize},
            ]}
            onPress={() =>
              Alert.alert('Notifications', 'You have no new notifications.')
            }>
            <IonIcons
              name="notifications-sharp"
              size={iconSize}
              color={'black'}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.name, {fontSize}]}>Welcome, {name}!</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 20,
          }}>
          <TouchableOpacity style={[styles.searchButton, {flex: 1}]}>
            <TextInput placeholder="Search" style={styles.searchInput} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, {marginLeft: 10}]}>
            <IonIcons name="filter" size={iconSize} color={'white'} />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.header, {width: headerWidth, height: headerHeight}]}>
          <TouchableOpacity
            style={[
              styles.headerbutton,
              {width: headerBWidth, height: headerBHeight},
            ]}>
            <FontAwesome6 name="bowl-food" size={iconSize} color={'white'} />
            <Text>Recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerbutton,
              {width: headerBWidth, height: headerBHeight},
            ]}>
            <Fontisto name="search" size={iconSize} color={'white'} />
            <Text>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerbutton,
              {width: headerBWidth, height: headerBHeight},
            ]}>
            <FontAwesome6 name="people-group" size={iconSize} color={'white'} />
            <Text>Community</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  image: {
    borderRadius: 10,
    resizeMode: 'cover',
  },
  notificationIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'white', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow position
    shadowOpacity: 1.8,
    shadowRadius: 5, // Shadow blur
    elevation: 9, // For Android
  },
  name: {
    paddingLeft: 20,
    paddingTop: 20,
    color: 'white',
    fontFamily: 'Poppins',
  },
  searchButton: {
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 10, 
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    shadowColor: 'white', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow position
    shadowOpacity: 1.8,
    shadowRadius: 5, // Shadow blur
    elevation: 9, // For Android // Match the height of the search bar
  },
  searchInput: {
    color: 'white',
    fontSize: 14,
    width: '100%',
  },
  filterButton: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40, // Keep the same height as search input
    width: 40,  // Make it square
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    margin: 20,
  },
  headerbutton: {
    backgroundColor: '#FF6347',
    borderRadius: 15,
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
});

export default Dashboard;
