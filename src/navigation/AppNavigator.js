import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExploreScreen from "../screens/ExploreScreen";
import CountryDetailScreen from "../screens/CountryDetailScreen";
import MyListScreen from "../screens/MyListScreen";
import EditTripScreen from "../screens/EditTripScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import AddCityScreen from "../screens/AddCityScreen";
import CityDetailsScreen from "../screens/CityDetailsScreen";
import NewTripScreen from "../screens/NewTripScreen";
import AddPlaceScreen from "../screens/AddPlaceScreen";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CountryDetail"
        component={CountryDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MyListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyList"
        component={MyListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditTrip"
        component={EditTripScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddCity"
        component={AddCityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CityDetails"
        component={CityDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPlace"
        component={AddPlaceScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function NewTripStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NewTrip"
        component={NewTripScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  const tabBarHeight = 65 + insets.bottom;
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2493FF",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            position: "absolute",
            height: tabBarHeight,
            paddingTop: 10,
            paddingBottom: insets.bottom || 10,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            backgroundColor: "#FFF",
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 2,
          },
        }}
      >
        <Tab.Screen
          name="ExploreTab"
          component={ExploreStack}
          options={{
            title: "Explorar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="NewTripTab"
          component={NewTripStack}
          options={{
            title: "Novo Roteiro",
            tabBarLabel: () => null,
            tabBarIcon: ({ focused }) => (
              <Ionicons name="add" size={32} color="#FFF" />
            ),
            tabBarIconStyle: {
              backgroundColor: "#2493FF",
              width: 62,
              height: 62,
              borderRadius: 31,
              marginTop: -28,
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />

        <Tab.Screen
          name="MyListTab"
          component={MyListStack}
          options={{
            title: "Minha Lista",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}