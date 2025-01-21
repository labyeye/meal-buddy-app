import React, {useState, useEffect} from 'react';
import jwtDecode from 'jwt-decode';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  Image,
  ScrollView,
  FlatList,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {TextInput} from 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const Dashboard = ({route, navigation}) => {
  const {width} = useWindowDimensions();
  const {name = 'User'} = route.params || {};
  const [category, setCategory] = useState('All');
  const [foods, setFoods] = useState([]);

  const categories = [
    'All',
    'Chinese',
    'Indian',
    'Japanese',
    'Korean',
    'Italian',
    'Mexican',
    'Thai',
    'Greek',
    'French',
    'Spanish',
    'American',
    'Mediterranean',
    'Middle Eastern',
    'African',
    'Vietnamese',
    'Brazilian',
    'Peruvian',
    'Caribbean',
    'German',
    'British',
  ];

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const url = getBackendUrl();
        const response = await axios.get(url);
        if (category.toLowerCase() === 'all') {
          setGroupedFoods(response.data); // Set grouped data
        } else {
          setFoods(response.data); // Set foods data
        }
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    fetchFoods();
  }, [category]);

  // Image and font sizes based on width
  const headerWidth = width > 400 ? 410 : width > 380 ? 350 : 335;
  const headerHeight = width > 400 ? 140 : width > 380 ? 120 : 100;
  const fontSize = width > 400 ? 39 : 30;
  const iconSize = width > 400 ? 30 : width > 380 ? 25 : 25;
  const imageSize = width > 400 ? 55 : width > 380 ? 45 : 35;

  const getBackendUrl = () => {
    if (Platform.OS === 'ios') {
      return `http://localhost:2000/api/food/category/${category}`;
    } else {
      return `http://10.0.2.2:2000/api/food/category/${category}`;
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
                  await axios.post(getBackendUrl(), {}, config);
                }
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userName');
                navigation.replace('Login');
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Something went wrong during logout.');
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
              backgroundColor: 'gray',
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
            <IonIcons name="filter" size={iconSize} color={'black'} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryButtons}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {categories.map(categoryOption => (
              <Pressable
                key={categoryOption}
                style={[
                  styles.categoryButton,
                  category === categoryOption && styles.selectedCategory,
                ]}
                onPress={() => setCategory(categoryOption)}>
                <Text style={styles.categoryButtonText}>{categoryOption}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <FlatList
  data={foods}
  numColumns={2}
  keyExtractor={item => item._id} // Use the _id as the key
  renderItem={({item}) => (
    <View style={styles.foodItem}>
      <Image source={{uri: item.uri}} style={styles.foodImage} />
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodDesc}>{item.desc}</Text>
      <Text style={styles.foodCategory}>Category: {item.category}</Text>
    </View>
  )}
  ListEmptyComponent={<Text>No food available</Text>}
/>

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
  },
  name: {
    paddingLeft: 20,
    paddingTop: 20,
    color: 'black',
    fontFamily: 'Poppins',
  },
  searchButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
  },
  searchInput: {
    color: 'black',
    fontSize: 14,
    width: '100%',
  },
  filterButton: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  categoryButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
    borderColor: '#FF6347',
    borderWidth: 2,
    height: 35,
    marginHorizontal: 5,
  },
  selectedCategory: {
    backgroundColor: '#fcc5bb',
  },
  categoryButtonText: {
    color: 'black',
    fontSize: 16,
  },
  foodItem: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default Dashboard;
