import { COLORS } from '@/constants/AppTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="identify"
        options={{
          title: 'Identify',
          tabBarIcon: ({ color }) => <Ionicons name="camera" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'My Finds',
          tabBarIcon: ({ color }) => <Ionicons name="leaf" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
