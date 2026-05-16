import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

import LandingScreen from '../screens/LandingScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AgentScreen from '../screens/AgentScreen';
import BillingScreen from '../screens/BillingScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ConversationsStack() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="DashboardHome" component={DashboardScreen} />
      <HomeStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.palette.coral,
        tabBarInactiveTintColor: theme.palette.textDim,
        tabBarStyle: {
          backgroundColor: theme.palette.white,
          borderTopColor: theme.palette.borderLight,
          borderTopWidth: 0.5,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Conversations: 'chatbubbles-outline',
            Agent: 'sparkles-outline',
            Profile: 'person-outline',
            Billing: 'card-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Conversations" component={ConversationsStack} />
      <Tab.Screen name="Agent" component={AgentScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Billing" component={BillingScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.palette.bg }}>
        <ActivityIndicator size="large" color={theme.palette.coral} />
      </View>
    );
  }

  const isAuthenticated = !!user;
  const isOnboarded = user?.onboarded;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen
            name="AuthFlow"
            component={AuthNavigator}
            options={{ animation: 'fade' }}
          />
        ) : !isOnboarded ? (
          <RootStack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animation: 'fade' }}
          />
        ) : (
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            options={{ animation: 'fade' }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
