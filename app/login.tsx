import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { COLORS, glow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';

export default function LoginScreen() {
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      Alert.alert('Sign In Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={260} />

      <View
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: top + 60, justifyContent: 'center' }}
      >
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View
            style={[
              {
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: COLORS.clay,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 3,
                borderColor: COLORS.cream,
              },
              glow(COLORS.clay, 14),
            ]}
          >
            <Ionicons name="leaf" size={36} color={COLORS.cream} />
          </View>
          <Text style={{ color: COLORS.ink, fontSize: 28, fontWeight: '700' }}>Welcome back</Text>
          <Text style={{ color: COLORS.bark, fontSize: 14, marginTop: 6 }}>
            Sign in to keep exploring.
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              color: COLORS.bark,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.6,
              marginBottom: 8,
            }}
          >
            EMAIL
          </Text>
          <TextInput
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.sand,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 15,
              color: COLORS.ink,
            }}
            onChangeText={setEmail}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor={COLORS.bark}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="email-input"
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: COLORS.bark,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.6,
              marginBottom: 8,
            }}
          >
            PASSWORD
          </Text>
          <TextInput
            style={{
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.sand,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 15,
              color: COLORS.ink,
            }}
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            placeholderTextColor={COLORS.bark}
            secureTextEntry
            autoCapitalize="none"
            testID="password-input"
          />
        </View>

        <Pressable
          onPress={signInWithEmail}
          disabled={loading}
          testID="sign-in-button"
          style={({ pressed }) => [
            {
              backgroundColor: COLORS.clay,
              borderRadius: 24,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            glow(COLORS.clay, 10),
          ]}
        >
          <Text
            style={{
              color: COLORS.cream,
              fontWeight: '700',
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>

        <Link href="/register" asChild>
          <Pressable style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: COLORS.bark, fontSize: 14 }}>
              New here?{' '}
              <Text style={{ color: COLORS.clay, fontWeight: '700' }}>Create an account</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
