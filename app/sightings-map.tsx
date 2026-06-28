import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';
import { formatRelativeDate } from '@/utils/date';

export default function SightingsMapScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);

  const mapped = useMemo(
    () => sightings.filter((s) => s.location != null),
    [sightings],
  );

  const initialRegion = useMemo(() => {
    if (mapped.length === 0) {
      // Default to Sonoran Desert if no pinned sightings
      return { latitude: 32.2, longitude: -110.9, latitudeDelta: 2.5, longitudeDelta: 2.5 };
    }
    const lats = mapped.map((s) => s.location!.lat);
    const lngs = mapped.map((s) => s.location!.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 0.1;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + pad, 0.05),
      longitudeDelta: Math.max(maxLng - minLng + pad, 0.05),
    };
  }, [mapped]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {mapped.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.location!.lat, longitude: s.location!.lng }}
            pinColor={COLORS.clay}
          >
            <View
              style={[
                {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: COLORS.clay,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: COLORS.cream,
                },
                softShadow(0.25, 8, 3),
              ]}
            >
              <SpeciesIcon kind={s.kind} size={20} color={COLORS.cream} />
            </View>
            <Callout onPress={() => router.push(`/species/${s.speciesId}` as never)}>
              <View style={{ width: 180, padding: 10 }}>
                <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>
                  {s.commonName}
                </Text>
                <Text
                  style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 12, marginTop: 1 }}
                >
                  {s.latinName}
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 11, marginTop: 4 }}>
                  {formatRelativeDate(s.capturedAt)}
                </Text>
                <Text style={{ color: COLORS.clay, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                  Tap to view species →
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Back button overlay */}
      <View
        style={{
          position: 'absolute',
          top: top + 12,
          left: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            {
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: COLORS.cream,
              alignItems: 'center',
              justifyContent: 'center',
            },
            softShadow(0.15, 10, 3),
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
      </View>

      {/* Pin count badge */}
      <View
        style={{
          position: 'absolute',
          top: top + 12,
          right: 16,
        }}
      >
        <View
          style={[
            {
              backgroundColor: COLORS.cream,
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 8,
            },
            softShadow(0.15, 10, 3),
          ]}
        >
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 13 }}>
            {mapped.length} {mapped.length === 1 ? 'pin' : 'pins'}
          </Text>
        </View>
      </View>

      {mapped.length === 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 40,
            left: 24,
            right: 24,
          }}
        >
          <View
            style={[
              {
                backgroundColor: COLORS.cream,
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
              },
              softShadow(0.15, 12, 4),
            ]}
          >
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
              No pinned sightings yet
            </Text>
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 13,
                textAlign: 'center',
                marginTop: 6,
                lineHeight: 18,
              }}
            >
              Your next sighting will be pinned here automatically when location is available.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
