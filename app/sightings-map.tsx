import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useSightings } from '@/hooks/useSightings';
import { hasNetwork } from '@/lib/network';
import { formatRelativeDate } from '@/utils/date';
import type { Sighting } from '@/lib/sightings';

export default function SightingsMapScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { sightings } = useSightings(user?.uid);

  // The tile basemap itself needs network — there's no downloadable-region
  // tile cache in this app (that'd mean a dedicated offline map SDK like
  // MapLibre, a much bigger native-dependency change than this screen
  // otherwise needs). Sighting *data* is already local-first per
  // CLAUDE.md's offline-first architecture, so rather than show a blank or
  // broken map with no signal, fall back to a plain list of the same pins —
  // degraded but fully functional in the field.
  const [checkingNetwork, setCheckingNetwork] = useState(true);
  const [offline, setOffline] = useState(false);

  const checkNetwork = useCallback(async () => {
    setCheckingNetwork(true);
    const online = await hasNetwork();
    setOffline(!online);
    setCheckingNetwork(false);
  }, []);

  useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

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
      {offline ? (
        <SightingsListFallback
          sightings={mapped}
          topInset={top}
          onRetry={checkNetwork}
          checking={checkingNetwork}
          onSelect={(s) => router.push(`/species/${s.speciesId}` as never)}
        />
      ) : (
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
              pinColor={COLORS.lichen}
            >
              <View
                style={[
                  {
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: COLORS.lichen,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: COLORS.bone,
                  },
                  softShadow(0.25, 8, 3),
                ]}
              >
                <SpeciesIcon kind={s.kind} size={20} color={COLORS.bone} />
              </View>
              <Callout onPress={() => router.push(`/species/${s.speciesId}` as never)}>
                <View style={{ width: 180, padding: 10 }}>
                  <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>
                    {s.commonName}
                  </Text>
                  <Text
                    style={{ color: COLORS.granite, fontStyle: 'italic', fontSize: 12, marginTop: 1 }}
                  >
                    {s.latinName}
                  </Text>
                  <Text style={{ color: COLORS.granite, fontSize: 11, marginTop: 4 }}>
                    {formatRelativeDate(s.capturedAt)}
                  </Text>
                  <Text style={{ color: COLORS.lichen, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                    Tap to view species →
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

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
              backgroundColor: COLORS.bone,
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
              backgroundColor: COLORS.bone,
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

      {mapped.length === 0 && !offline && (
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
                backgroundColor: COLORS.bone,
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
                color: COLORS.granite,
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

function SightingsListFallback({
  sightings,
  topInset,
  onRetry,
  checking,
  onSelect,
}: {
  sightings: Sighting[];
  topInset: number;
  onRetry: () => void;
  checking: boolean;
  onSelect: (s: Sighting) => void;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        data={sightings}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingTop: topInset + 68, paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
        ListHeaderComponent={
          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.granite,
              },
              softShadow(0.04, 5, 1),
            ]}
          >
            <Ionicons name="cloud-offline-outline" size={20} color={COLORS.granite} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 13 }}>
                No signal — showing your sightings as a list
              </Text>
              <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 2 }}>
                The map basemap needs a connection. Your pins are still all here.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onRetry}
              disabled={checking}
              accessibilityLabel="Retry loading the map"
              accessibilityRole="button"
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: COLORS.lichen,
                opacity: checking ? 0.6 : 1,
              }}
            >
              <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 12 }}>
                {checking ? 'Checking…' : 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View
            style={[
              { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, alignItems: 'center' },
              softShadow(0.04, 5, 1),
            ]}
          >
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
              No pinned sightings yet
            </Text>
            <Text style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
              Your next sighting will show up here automatically when location is available.
            </Text>
          </View>
        }
        renderItem={({ item: s }) => (
          <TouchableOpacity
            onPress={() => onSelect(s)}
            accessibilityLabel={`View ${s.commonName}`}
            accessibilityRole="button"
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: COLORS.granite,
              },
              softShadow(0.03, 4, 1),
            ]}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.lichen,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SpeciesIcon kind={s.kind} size={22} color={COLORS.bone} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>{s.commonName}</Text>
              <Text style={{ color: COLORS.granite, fontStyle: 'italic', fontSize: 12, marginTop: 1 }}>
                {s.latinName}
              </Text>
              <Text style={{ color: COLORS.granite, fontSize: 11, marginTop: 3 }}>
                {formatRelativeDate(s.capturedAt)} · {s.location!.lat.toFixed(3)}, {s.location!.lng.toFixed(3)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.granite} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
