import React, {useState, useEffect} from 'react';
import { jwtDecode } from "jwt-decode";
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
  const [userId, setUserId] = useState(null);

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
        // Add userId as a query parameter if available
        const queryUrl = userId ? `${url}?userId=${userId}` : url;
        const response = await axios.get(queryUrl);
        setFoods(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };
  
    fetchFoods();
  }, [category, userId]); 

  const headerWidth = width > 400 ? 410 : width > 380 ? 350 : 335;
  const headerHeight = width > 400 ? 140 : width > 380 ? 120 : 100;
  const fontSize = width > 400 ? 39 : 30;
  const iconSize = width > 400 ? 30 : width > 380 ? 25 : 25;
  const imageSize = width > 400 ? 55 : width > 380 ? 45 : 35;
  const foodItemWidth = width > 400 ? 210 : width > 380 ? 165 : 155;
  const foodItemHeight = width > 400 ? 300 : width > 380 ? 230 : 210;
  const foodImageWidth = width > 400 ? 210 : width > 380 ? 165 : 155;
  const foodImageHeight = width > 400 ? 220 : width > 380 ? 170 : 160;

  const getBackendUrl = () => {
    const baseUrl = Platform.OS === 'ios' 
      ? 'http://localhost:2000/api/food/category/' 
      : 'http://10.0.2.2:2000/api/food/category/';
    
    return `${baseUrl}${category}`;
  };
  const getBackendLike = (id) => {
    if (Platform.OS === 'ios') {
      return `http://localhost:2000/api/food/liked/${id}`;
    } else {
      return `http://10.0.2.2:2000/api/food/liked/${id}`;
    }
  };
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decodedToken = jwtDecode(token);
          // Make sure you're extracting the correct field from your token
          // This might be 'id', '_id', 'userId', etc. depending on how your token is structured
          console.log("Decoded token:", decodedToken); // Debug log to see token structure
          setUserId(decodedToken.userId || decodedToken.id || decodedToken._id);
        }
      } catch (error) {
        console.error('Error loading user ID:', error);
      }
    };
    
    loadUserId();
  }, []);
  
  const getUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const decodedToken = jwtDecode(token);
        console.log("Token structure:", decodedToken); // Debug to see token structure
        // Try different common ID field names
        return decodedToken.userId || decodedToken.id || decodedToken._id || decodedToken.sub;
      }
      return null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
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
  const toggleLike = async (id) => {
    try {
      // Check and log the current userId
      console.log('Current userId state:', userId);
      
      if (!userId) {
        console.error('No user ID available');
        Alert.alert('Error', 'Please log in to like items');
        
        // As a fallback, try to get the userId one more time
        const fallbackId = await getUserId();
        if (!fallbackId) {
          return; // Still no userId available
        }
        setUserId(fallbackId); // Set it for future use
      }
      
      const token = await AsyncStorage.getItem('userToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      
      // Use userId from state or the fallback one we just retrieved
      const currentUserId = userId || await getUserId();
      console.log('Sending request with userId:', currentUserId); // Debug log
      
      const response = await axios.post(
        getBackendLike(id), 
        { userId: currentUserId }, 
        config
      );

      // Rest of your function remains the same...
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Something went wrong while toggling like.');
    }
  };
  
  const renderFoodItem = ({item}) => (
    <View
      style={[
        styles.foodItem,
        {width: foodItemWidth, height: foodItemHeight},
      ]}>
      <Image
        source={{uri: item.uri}}
        style={[
          styles.foodImage,
          {width: foodImageWidth, height: foodImageHeight},
        ]}
      />
      <View style={styles.foodInfoContainer}>
        <Text style={styles.foodName}>{item.name}</Text>
        <View style={styles.likeContainer}>
          <Pressable onPress={() => toggleLike(item._id)}>
            <FontAwesome
              name={item.liked ? 'heart' : 'heart-o'}
              size={25}
              color={item.liked ? 'red' : 'black'}
            />
          </Pressable>
          <Text style={styles.likeCount}>{item.likes || 0}</Text>
        </View>
      </View>
    </View>
  );
  
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
          keyExtractor={item => item._id}
          renderItem={renderFoodItem}
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
    alignItems: 'center',
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
  },
  foodImage: {
    borderRadius: 10,
  },
  foodName: {
    color: 'black',
    fontSize: 26,
    fontWeight: 'bold',
  },
  foodDesc: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
  },
  foodInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeCount: {
    fontSize: 16,
    color: 'black',
    marginLeft: 5,
  },
});

export default Dashboard;
