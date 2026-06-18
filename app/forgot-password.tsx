import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { TextField } from '@/components/TextField';
import { COLORS, glow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function updateEmail(value: string) {
    setEmail(value);
    if (emailError) setEmailError(undefined);
    if (submitError) setSubmitError(undefined);
  }

  async function sendReset() {
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e: unknown) {
      setSubmitError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={200} />

      <View
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: top + 48, justifyContent: 'center' }}
      >
        {sent ? (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: COLORS.sage,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons name="mail" size={34} color={COLORS.cream} />
            </View>
            <Text
              style={{ color: COLORS.ink, fontSize: 26, fontWeight: '700', textAlign: 'center' }}
            >
              Check your inbox
            </Text>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 14,
                textAlign: 'center',
                lineHeight: 21,
                marginTop: 4,
              }}
            >
              We sent a reset link to {email.trim()}. It may take a minute to arrive.
            </Text>
            <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
              <Text style={{ color: COLORS.clay, fontWeight: '700', fontSize: 15 }}>
                Back to sign in
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: COLORS.ink, fontSize: 28, fontWeight: '700' }}>
                Forgot password?
              </Text>
              <Text style={{ color: COLORS.bark, fontSize: 14, marginTop: 6 }}>
                Enter your email and we&apos;ll send a reset link.
              </Text>
            </View>

            <TextField
              label="EMAIL"
              value={email}
              onChangeText={updateEmail}
              placeholder="email@address.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
            />

            {submitError ? (
              <Text style={{ color: COLORS.clay, fontSize: 13, marginBottom: 12 }}>
                {submitError}
              </Text>
            ) : null}

            <Pressable
              onPress={sendReset}
              disabled={loading}
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
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={{ marginTop: 22, alignItems: 'center' }}>
              <Text style={{ color: COLORS.bark, fontSize: 14 }}>
                Back to{' '}
                <Text style={{ color: COLORS.clay, fontWeight: '700' }}>sign in</Text>
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
