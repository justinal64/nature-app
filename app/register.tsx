import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { COLORS, glow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'sentences',
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'sentences' | 'none' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}) {
  return (
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
        {label}
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
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={COLORS.bark}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function RegisterScreen() {
  const { top } = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!firstName || !lastName) {
      Alert.alert('Missing Info', 'Please enter your first and last name.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      await sendEmailVerification(userCredential.user);
    } catch (error: unknown) {
      Alert.alert('Registration Error', getUserFriendlyError(error));
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
            <Field
              label="FIRST NAME"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Iris"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="LAST NAME"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Calloway"
            />
          </View>
        </View>

        <Field
          label="EMAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Field
          label="PASSWORD"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
        />

        <Pressable
          onPress={signUp}
          disabled={loading}
          style={({ pressed }) => [
            {
              marginTop: 6,
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
            {loading ? 'Creating account…' : 'Create account'}
          </Text>
        </Pressable>

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
