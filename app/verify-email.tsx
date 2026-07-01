import { Ionicons } from '@expo/vector-icons';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LandscapeHeader } from '@/components/LandscapeHeader';
import { COLORS, glow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { getUserFriendlyError } from '@/utils/errors';

export default function VerifyEmailScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const checkVerification = async () => {
    setLoading(true);
    try {
      const verified = await refreshUser();
      if (!verified) {
        Alert.alert('Not verified yet', 'Please check your email and click the link.');
      }
    } catch (error: unknown) {
      Alert.alert('Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    try {
      if (user) {
        await sendEmailVerification(user);
        Alert.alert('Email sent', 'Check your inbox (and spam folder).');
      }
    } catch (error: unknown) {
      Alert.alert('Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={260} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 28,
          paddingTop: top + 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={[
            {
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: COLORS.sage,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              borderWidth: 4,
              borderColor: COLORS.cream,
            },
            glow(COLORS.sage, 14),
          ]}
        >
          <Ionicons name="mail-unread-outline" size={42} color={COLORS.cream} />
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
            marginTop: 10,
            lineHeight: 20,
          }}
        >
          We sent a verification link to
        </Text>
        <Text
          style={{
            color: COLORS.clay,
            fontSize: 15,
            fontWeight: '700',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {user?.email}
        </Text>
        <Text
          style={{
            color: COLORS.bark,
            fontSize: 13,
            textAlign: 'center',
            marginTop: 18,
            lineHeight: 19,
          }}
        >
          You&apos;ll need to verify your email before exploring the guide.
        </Text>

        <TouchableOpacity
          onPress={checkVerification}
          disabled={loading}
          activeOpacity={0.8}
          style={[
            {
              marginTop: 36,
              width: '100%',
              backgroundColor: COLORS.clay,
              borderRadius: 24,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            },
            glow(COLORS.clay, 10),
          ]}
        >
          <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>
            {loading ? 'Checking…' : "I've verified it"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resendEmail}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            marginTop: 12,
            width: '100%',
            borderRadius: 24,
            paddingVertical: 16,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: COLORS.bark,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: COLORS.bark, fontWeight: '700', fontSize: 15 }}>Resend email</Text>
        </TouchableOpacity>

        <Pressable onPress={signOut} style={{ marginTop: 24, padding: 8 }}>
          <Text
            style={{
              color: COLORS.bark,
              fontSize: 13,
              textDecorationLine: 'underline',
            }}
          >
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
