import { Link } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import { COLORS, textGlow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';

export default function RegisterScreen() {
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
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: `${firstName} ${lastName}` });
      await sendEmailVerification(credential.user);
    } catch (error: unknown) {
      Alert.alert('Registration Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 p-6 justify-center bg-background">
      <Text
        className="text-3xl font-bold text-primary text-center mb-12 tracking-widest"
        style={textGlow(COLORS.primary, 8)}
      >
        JOIN WILDLENS
      </Text>

      <View className="flex-row justify-between">
        <View className="w-[48%]">
          <FormInput label="FIRST NAME" onChangeText={setFirstName} value={firstName} placeholder="Jane" />
        </View>
        <View className="w-[48%]">
          <FormInput label="LAST NAME" onChangeText={setLastName} value={lastName} placeholder="Doe" />
        </View>
      </View>

      <FormInput
        label="EMAIL"
        onChangeText={setEmail}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <FormInput
        label="PASSWORD"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholder="Password"
        autoCapitalize="none"
      />

      <Button
        label={loading ? 'CREATING...' : 'CREATE ACCOUNT'}
        onPress={signUp}
        disabled={loading}
      />

      <Link href="/login" asChild>
        <Pressable className="mt-6 items-center">
          <Text className="text-secondary font-bold text-sm tracking-widest">
            ALREADY HAVE AN ACCOUNT?
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
