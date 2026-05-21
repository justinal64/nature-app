import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import { COLORS, textGlow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
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
    <View className="flex-1 p-6 justify-center bg-background">
      <Text
        className="text-3xl font-bold text-primary text-center mb-12 tracking-widest"
        style={textGlow(COLORS.primary, 8)}
      >
        WELCOME BACK
      </Text>

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

      <Button label={loading ? 'SIGNING IN...' : 'SIGN IN'} onPress={signIn} disabled={loading} />

      <Link href="/register" asChild>
        <Pressable className="mt-6 items-center">
          <Text className="text-secondary font-bold text-sm tracking-widest">CREATE AN ACCOUNT</Text>
        </Pressable>
      </Link>
    </View>
  );
}
