import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PasswordInput } from '@/components/PasswordInput';
import { TextField } from '@/components/TextField';
import { COLORS, glow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function updateEmail(value: string) {
    setEmail(value);
    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
  }

  function updatePassword(value: string) {
    setPassword(value);
    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
  }

  async function signInWithEmail() {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: unknown) {
      Alert.alert('Sign in error', getUserFriendlyError(error));
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

        <TextField
          label="EMAIL"
          value={email}
          onChangeText={updateEmail}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
          testID="email-input"
        />

        <PasswordInput
          label="PASSWORD"
          value={password}
          onChangeText={updatePassword}
          error={errors.password}
          testID="password-input"
        />

        <Pressable
          onPress={() => router.push('/forgot-password')}
          style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 6 }}
        >
          <Text style={{ color: COLORS.clay, fontSize: 13, fontWeight: '600' }}>
            Forgot password?
          </Text>
        </Pressable>

        <TouchableOpacity
          onPress={signInWithEmail}
          disabled={loading}
          activeOpacity={0.8}
          testID="sign-in-button"
          style={[
            {
              marginTop: 6,
              backgroundColor: COLORS.clay,
              borderRadius: 24,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
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
        </TouchableOpacity>

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
