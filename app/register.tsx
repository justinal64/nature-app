import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PasswordInput } from '@/components/PasswordInput';
import { TextField } from '@/components/TextField';
import { COLORS, glow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export default function RegisterScreen() {
  const { top } = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Errors>(field: K, setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };
  }

  async function signUp() {
    const nextErrors: Errors = {
      firstName: validateRequired(firstName, 'First name'),
      lastName: validateRequired(lastName, 'Last name'),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`,
      });
      await sendEmailVerification(userCredential.user);
    } catch (error: unknown) {
      Alert.alert('Registration error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={240} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: top + 48,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View
            style={[
              {
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.sage,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 3,
                borderColor: COLORS.cream,
              },
              glow(COLORS.sage, 12),
            ]}
          >
            <Ionicons name="leaf-outline" size={34} color={COLORS.cream} />
          </View>
          <Text style={{ color: COLORS.ink, fontSize: 26, fontWeight: '700' }}>
            Start your field guide
          </Text>
          <Text style={{ color: COLORS.bark, fontSize: 14, marginTop: 6 }}>
            Create an account to save what you find.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="FIRST NAME"
              value={firstName}
              onChangeText={update('firstName', setFirstName)}
              placeholder="Iris"
              error={errors.firstName}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="LAST NAME"
              value={lastName}
              onChangeText={update('lastName', setLastName)}
              placeholder="Calloway"
              error={errors.lastName}
            />
          </View>
        </View>

        <TextField
          label="EMAIL"
          value={email}
          onChangeText={update('email', setEmail)}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />

        <PasswordInput
          label="PASSWORD"
          value={password}
          onChangeText={update('password', setPassword)}
          error={errors.password}
        />

        <TouchableOpacity
          onPress={signUp}
          disabled={loading}
          activeOpacity={0.8}
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
            {loading ? 'Creating account…' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <Link href="/login" asChild>
          <Pressable style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: COLORS.bark, fontSize: 14 }}>
              Already have an account?{' '}
              <Text style={{ color: COLORS.clay, fontWeight: '700' }}>Sign in</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </View>
  );
}
