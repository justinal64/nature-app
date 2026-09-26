import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';
import { useINatAuth } from '@/context/INatAuthContext';

export default function INaturalistConnectScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { status, username, error, connect, disconnect } = useINatAuth();

  const confirmDisconnect = () => {
    Alert.alert(
      'Disconnect iNaturalist',
      'Identification will fall back to the on-device model until you reconnect.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => disconnect() },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          paddingTop: top + 14,
          paddingBottom: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.granite,
          backgroundColor: COLORS.background,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.granite,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>iNaturalist</Text>
      </View>

      <View style={{ padding: 20, gap: 20 }}>
        <View
          style={[
            {
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: COLORS.granite,
              gap: 12,
              alignItems: 'center',
            },
            softShadow(0.04, 5, 1),
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: COLORS.bone,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={status === 'connected' ? 'leaf' : 'leaf-outline'}
              size={28}
              color={COLORS.lichen}
            />
          </View>

          {status === 'connected' ? (
            <>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>
                Connected{username ? ` as @${username}` : ''}
              </Text>
              <Text
                style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center', lineHeight: 19 }}
              >
                WildLens is using iNaturalist&apos;s Computer Vision model for identification.
              </Text>
              <TouchableOpacity
                onPress={confirmDisconnect}
                accessibilityLabel="Disconnect iNaturalist account"
                accessibilityRole="button"
                style={{ marginTop: 8, paddingVertical: 10, paddingHorizontal: 20 }}
              >
                <Text style={{ color: COLORS.lichen, fontWeight: '700', fontSize: 14 }}>
                  Disconnect
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16, textAlign: 'center' }}
              >
                Connect your iNaturalist account
              </Text>
              <Text
                style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center', lineHeight: 19 }}
              >
                WildLens uses iNaturalist&apos;s Computer Vision model for much more accurate
                species identification. If you don&apos;t connect, identification falls back to the
                on-device model.
              </Text>
              {status === 'error' && error ? (
                <Text
                  style={{
                    color: COLORS.lichen,
                    fontSize: 13,
                    textAlign: 'center',
                    marginTop: 4,
                    fontWeight: '500',
                  }}
                >
                  {error}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={connect}
                disabled={status === 'connecting'}
                accessibilityLabel="Connect iNaturalist account"
                accessibilityRole="button"
                style={{
                  marginTop: 8,
                  backgroundColor: COLORS.lichen,
                  borderRadius: 24,
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  opacity: status === 'connecting' ? 0.7 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {status === 'connecting' && <ActivityIndicator color={COLORS.bone} size="small" />}
                <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 15 }}>
                  {status === 'connecting' ? 'Connecting…' : 'Connect iNaturalist Account'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
