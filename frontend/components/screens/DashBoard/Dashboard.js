import React, {useState, useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {jwtDecode} from 'jwt-decode';
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
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
  
  const fetchFoods = async () => {
    try {
      const url = getBackendUrl();
      const queryUrl = userId ? `${url}?userId=${userId}` : url;
      const response = await axios.get(queryUrl);
      setFoods(response.data);
      setFilteredFoods(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };
  
  useEffect(() => {
    fetchFoods();
  }, [category, userId]);

  // Filter foods when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFoods(foods);
    } else {
      const filtered = foods.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFoods(filtered);
    }
  }, [searchTerm, foods]);
  
  const toggleLike = async id => {
    try {
      // Find the food item by ID and update its like status instantly
      setFoods(prevFoods =>
        prevFoods.map(food =>
          food._id === id
            ? {
                ...food,
                liked: !food.liked,
                likes: food.liked ? food.likes - 1 : food.likes + 1,
              }
            : food
        )
      );
  
      // Send the like/unlike request to the backend
      const token = await AsyncStorage.getItem('userToken');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
  
      await axios.post(getBackendLike(id), { userId }, config);
  
      fetchFoods();
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Could not update like. Please try again.');
      setFoods(prevFoods =>
        prevFoods.map(food =>
          food._id === id
            ? {
                ...food,
                liked: !food.liked, // revert like state
                likes: food.liked ? food.likes + 1 : food.likes - 1,
              }
            : food
        )
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId || decodedToken.id || decodedToken._id;
            setUserId(userId);
      
            const url = getBackendUrl('details');
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
      
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
      
            const userData = await response.json();
      
            // Construct full photo URL
            const getFullImageUrl = (relativeUrl) => {
              if (!relativeUrl || relativeUrl.trim() === '') return null;
              const baseUrl = Platform.OS === 'ios' ? 'http://localhost:2000' : 'http://10.0.2.2:2000';
              const normalizedPath = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
              return `${baseUrl}${normalizedPath}`;
            }
      
            setUserPhoto(userData?.profilePhoto ? getFullImageUrl(userData.profilePhoto) : null);
            navigation.setParams({ name: userData?.name || 'User' });
      
            console.log('Fetched user photo URL:', userPhoto);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };
      
      loadUserData();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const headerWidth = width > 400 ? 410 : width > 380 ? 350 : 335;
  const headerHeight = width > 400 ? 140 : width > 380 ? 120 : 100;
  const fontSize = width > 400 ? 39 : 30;
  const iconSize = width > 400 ? 30 : width > 380 ? 25 : 25;
  const imageSize = width > 400 ? 55 : width > 380 ? 45 : 35;
  const foodItemWidth = width > 400 ? 170 : width > 380 ? 165 : 155;
  const foodItemHeight = width > 400 ? 220 : width > 380 ? 230 : 210;
  const foodImageWidth = width > 400 ? 170 : width > 380 ? 165 : 155;
  const foodImageHeight = width > 400 ? 155 : width > 380 ? 170 : 160;

  const getBackendUrl = (endpoint = '') => {
    const baseUrl = Platform.OS === 'ios' 
      ? 'http://localhost:2000' 
      : 'http://10.0.2.2:2000';
  
    if (endpoint === 'details') {
      return `${baseUrl}/api/profile/details`;
    } else {
      return `${baseUrl}/api/food/category/${category}`;
    }
  };
  
  const getBackendLike = id => {
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
          console.log('Decoded token:', decodedToken); // Debug log to see token structure
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
        console.log('Token structure:', decodedToken); // Debug to see token structure
        // Try different common ID field names
        return (
          decodedToken.userId ||
          decodedToken.id ||
          decodedToken._id ||
          decodedToken.sub
        );
      }
      return null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  const renderFoodItem = ({item}) => (
    <View
      style={[styles.foodItem, {width: foodItemWidth, height: foodItemHeight}]}>
      <Image
        source={{uri: item.uri}}
        style={[
          styles.foodImage,
          {width: foodImageWidth, height: foodImageHeight},
        ]}
      />
      <View
        style={{
          width: '100%',
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={styles.foodInfoContainer}>
          <Text style={styles.foodName}>{item.name}</Text>
        </View>
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
            }}
            onPress={() => navigation.navigate('Profile')}>
            <Image
              source={
                userPhoto
                  ? {uri: userPhoto}
                  : require('../../../src/assets/images/male.png')
              }
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
          <View style={[styles.searchButton, {flex: 1, flexDirection: 'row', alignItems: 'center'}]}>
            <TextInput 
              placeholder="Search food" 
              style={styles.searchInput} 
              value={searchTerm}
              onChangeText={handleSearch}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <IonIcons name="close-circle" size={20} color={'gray'} />
              </TouchableOpacity>
            )}
          </View>
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
          data={filteredFoods}
          numColumns={3}
          keyExtractor={item => item._id}
          renderItem={renderFoodItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchTerm.length > 0 
                  ? `No food found matching "${searchTerm}"` 
                  : "No food available"}
              </Text>
            </View>
          }
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
    flex: 1,
  },
  clearButton: {
    padding: 5,
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
    resizeMode: 'cover',
  },
  foodName: {
    color: 'black',
    fontSize: 20,
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
    width: '82%',
  },
  likeContainer: {
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 16,
    color: 'black',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
});

export default Dashboard;