import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { ComponentProps, useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { COLORS, glow } from '@/constants/AppTheme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  outline,
  filled,
  focused,
  color,
  size = 22,
}: {
  outline: IoniconName;
  filled: IoniconName;
  focused: boolean;
  color: string;
  size?: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.22, { damping: 11, stiffness: 320 }),
        withSpring(1, { damping: 14, stiffness: 240 }),
      );
    }
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={focused ? filled : outline} size={size} color={color} />
    </Animated.View>
  );
}

function CameraTabButton() {
  const router = useRouter();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.55 }],
    opacity: 0.4 * (1 - pulse.value),
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ marginTop: -22, width: 60, height: 60 }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              pointerEvents: 'none',
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: COLORS.clay,
            },
            ringStyle,
          ]}
        />
        <PressableScale
          accessibilityLabel="Capture photo"
          accessibilityRole="button"
          onPress={() => router.navigate('/capture')}
          scaleTo={0.9}
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: COLORS.clay,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 4,
              borderColor: COLORS.background,
            },
            glow(COLORS.clay, 12),
          ]}
        >
          <Ionicons name="camera" size={26} color={COLORS.cream} />
        </PressableScale>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.sand,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.clay,
        tabBarInactiveTintColor: COLORS.bark,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon outline="home-outline" filled="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: 'Guide',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon outline="book-outline" filled="book" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="capture-tab"
        options={{
          title: '',
          tabBarButton: () => <CameraTabButton />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon outline="bookmark-outline" filled="bookmark" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              outline="person-circle-outline"
              filled="person-circle"
              focused={focused}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
