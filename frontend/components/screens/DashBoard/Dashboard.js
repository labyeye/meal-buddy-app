import React, {useState, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
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
import LinearGradient from 'react-native-linear-gradient';

const Dashboard = ({route, navigation}) => {
  const {width, height} = useWindowDimensions();
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

  // Backend URL helpers
  const getBackendUrl = (endpoint = '') => {
    const baseUrl =
      Platform.OS === 'ios' ? 'http://localhost:2000' : 'http://10.0.2.2:2000';

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

  // Fetch foods
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

  // Like toggle handler
  // Modify the user data loading effect to explicitly set the userId
  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            // Decode the token to extract user ID
            const decodedToken = jwtDecode(token);
            const extractedUserId = decodedToken.userId || decodedToken.id;

            console.log('Extracted User ID:', extractedUserId);

            // Set the user ID in state
            setUserId(extractedUserId);

            const url = getBackendUrl('details');
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            // Rest of the existing error handling...
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          Alert.alert(
            'Error',
            'Could not load user profile. Please log in again.',
          );
        }
      };

      loadUserData();
    }, []),
  );

  // Modify the toggleLike function to use a more robust user ID retrieval
  const toggleLike = async id => {
    try {
      // Optimistically update the UI
      setFoods(prevFoods =>
        prevFoods.map(food =>
          food._id === id
            ? {
                ...food,
                liked: !food.liked,
                likes: food.liked ? food.likes - 1 : food.likes + 1,
              }
            : food,
        ),
      );

      // Retrieve token and verify
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Decode token to get user ID
      const decodedToken = jwtDecode(token);
      const currentUserId = decodedToken.userId || decodedToken.id;

      if (!currentUserId) {
        throw new Error('Could not extract user ID from token');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Log the request details for debugging
      console.log('Like Request Details:', {
        url: getBackendLike(id),
        method: 'POST',
        data: {userId: currentUserId},
        headers: config.headers,
      });

      const response = await axios.post(
        getBackendLike(id),
        {userId: currentUserId},
        config,
      );

      // Log successful response
      console.log('Like Response:', response.data);
    } catch (error) {
      console.error('Detailed Like Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // Revert the optimistic update if the backend request fails
      setFoods(prevFoods =>
        prevFoods.map(food =>
          food._id === id
            ? {
                ...food,
                liked: !food.liked,
                likes: food.liked ? food.likes + 1 : food.likes - 1,
              }
            : food,
        ),
      );

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Could not update like. Please check your connection.',
      );
    }
  };

  // Search and filter handlers
  const handleSearch = text => {
    setSearchTerm(text);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Effects and focus effects
  useFocusEffect(
    React.useCallback(() => {
      fetchFoods();
    }, [category, userId]),
  );

  // Search effect
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFoods(foods);
    } else {
      const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredFoods(filtered);
    }
  }, [searchTerm, foods]);

  // User data loading
  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
            // Verify token is correctly stored during login
            console.log('Token:', token);

            const url = getBackendUrl('details');
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            // Add more robust error handling
            if (response.status === 401) {
              // Token might be expired or invalid
              Alert.alert('Session Expired', 'Please log in again');
              navigation.navigate('Login');
              return;
            }

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Detailed error:', errorText);
              throw new Error('Failed to fetch user data');
            }

            const userData = await response.json();
            console.log('User Data:', userData);

            // Rest of the code...
          }
        } catch (error) {
          console.error('Detailed error loading user data:', error);
          // Consider adding a more user-friendly error handling
          Alert.alert(
            'Error',
            'Could not load user profile. Please try again later.',
          );
        }
      };

      loadUserData();

      return () => {
        // Clean up if needed
      };
    }, []),
  );

  // Render category item
  const renderCategoryItem = categoryOption => {
    const isSelected = category === categoryOption;
    return (
      <Pressable
        key={categoryOption}
        style={[styles.categoryButton, isSelected && styles.selectedCategory]}
        onPress={() => setCategory(categoryOption)}>
        <Text
          style={[
            styles.categoryButtonText,
            isSelected && styles.selectedCategoryText,
          ]}>
          {categoryOption}
        </Text>
      </Pressable>
    );
  };

  // Render food item
  const renderFoodItem = ({item}) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() =>
        navigation.navigate('FoodPage', {
          foodId: item._id,
          foodPreview: item,
          onLikeToggle: (id, liked, likesCount) => {
            setFoods(prevFoods =>
              prevFoods.map(food =>
                food._id === id
                  ? {
                      ...food,
                      liked: liked,
                      likes: likesCount,
                    }
                  : food,
              ),
            );
          },
        })
      }>
      <View style={styles.foodCardContent}>
        <View style={styles.foodCardImageContainer}>
          <Image source={{uri: item.uri}} style={styles.foodCardImage} />
        </View>

        <View style={styles.foodCardDetailsContainer}>
          <View style={styles.foodCardTextContainer}>
            <Text style={styles.foodCardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.foodCardCalories}>
              {item.calories || '0 cal'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.foodCardAddButton,
              item.liked
                ? styles.foodCardLikedButton
                : styles.foodCardUnlikedButton,
            ]}
            onPress={e => {
              e.stopPropagation();
              toggleLike(item._id);
            }}>
            <IonIcons
              name={item.liked ? 'heart' : 'heart-outline'}
              size={18}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={['#FFF9E8', '#FF6347']}
        style={styles.gradientBackground}>
        <SafeAreaView style={styles.container}>
          {/* Top Navigation */}
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => navigation.navigate('Profile')}>
              <Image
                source={
                  userPhoto
                    ? {uri: userPhoto}
                    : require('../../../src/assets/images/male.png')
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>

            {/* Notification with subtle badge */}
            <TouchableOpacity
              style={styles.notificationIcon}
              onPress={() =>
                Alert.alert('Notifications', 'You have no new notifications.')
              }>
              <IonIcons
                name="notifications-sharp"
                size={24}
                color={'#FF6347'}
              />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>0</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.name}>Welcome, {name}!</Text>
            <Text style={styles.subheader}>Discover Your Next Meal</Text>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <IonIcons
                name="search"
                size={20}
                color="gray"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search cuisines & dishes"
                placeholderTextColor="gray"
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={handleSearch}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.clearButton}>
                  <IonIcons name="close-circle" size={20} color={'gray'} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <IonIcons name="filter" size={24} color={'white'} />
            </TouchableOpacity>
          </View>

          {/* Category Scroll */}
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {categories.map(renderCategoryItem)}
            </ScrollView>
          </View>

          {/* Food List */}
          <FlatList
            data={filteredFoods}
            numColumns={2}
            key={2}
            keyExtractor={item => item._id}
            renderItem={renderFoodItem}
            contentContainerStyle={styles.foodListContainer}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchTerm.length > 0
                    ? `No food found matching "${searchTerm}"`
                    : 'No food available'}
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileImageContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  notificationIcon: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  name: {
    color: 'black',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  subheader: {
    color: 'black',
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'Poppins-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  foodCardAddButton: {
    backgroundColor: '#4CAF50', // Green color
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.3s',
  },
  foodCardLikedButton: {
    backgroundColor: '#FF6347', // Red color when liked
  },
  foodCardAddButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'black',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  clearButton: {
    padding: 5,
  },
  filterButton: {
    backgroundColor: '#FF6347',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  categorySection: {
    marginTop: 20,
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  selectedCategory: {
    backgroundColor: 'white',
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  selectedCategoryText: {
    color: '#FF6347',
  },
  foodListContainer: {
    paddingHorizontal: 10,
  },

  // New Food Card Styles
  foodCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '45%', // Adjust to fit two cards side by side
  },
  foodCardContent: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  foodCardImageContainer: {
    aspectRatio: 1, // Square image
    width: '100%',
  },
  foodCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  foodCardDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  foodCardTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  foodCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  foodCardCalories: {
    fontSize: 12,
    color: 'gray',
  },
  foodCardAddButton: {
    backgroundColor: '#4CAF50', // Green color
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodCardAddButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
});

export default Dashboard;
