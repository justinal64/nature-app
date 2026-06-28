import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutDown,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, softShadow } from '@/constants/AppTheme';
import { CATALOG, getRegionForCoords, isActiveNow } from '@/constants/catalog';
import type { Species } from '@/constants/catalog';

type OverlaySpecies = Species & { tip: string };

function getContextualSpecies(lat: number | null, lng: number | null): OverlaySpecies[] {
  const region = lat !== null && lng !== null ? getRegionForCoords(lat, lng) : null;

  return CATALOG.filter((s) => {
    const matchesRegion = !region || s.region === region;
    return matchesRegion && isActiveNow(s.id);
  })
    .slice(0, 6)
    .map((s) => ({
      ...s,
      tip: s.idTips[0] ?? s.description.split('.')[0],
    }));
}

export default function FieldCamScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [candidates, setCandidates] = useState<OverlaySpecies[]>([]);
  const [selected, setSelected] = useState<OverlaySpecies | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  // Scanning animation
  const scanY = useSharedValue(0);
  useEffect(() => {
    scanY.value = withRepeat(
      withSequence(withTiming(1, { duration: 2200 }), withTiming(0, { duration: 2200 })),
      -1,
      false,
    );
  }, [scanY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanY.value * 80 + 5}%`,
  }));

  // Get location once
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return;
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then((pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setCandidates(getContextualSpecies(coords.lat, coords.lng));
        })
        .catch(() => setCandidates(getContextualSpecies(null, null)));
    });
  }, []);

  // Set default candidates without location while waiting
  useEffect(() => {
    if (candidates.length === 0) {
      setCandidates(getContextualSpecies(null, null));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="camera-outline" size={52} color={COLORS.cream} />
        <Text style={{ color: COLORS.cream, fontSize: 20, fontWeight: '700', marginTop: 20, textAlign: 'center' }}>
          Camera access needed
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ marginTop: 24, backgroundColor: COLORS.clay, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>Allow Camera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.bark, fontSize: 15 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      {/* Scanning overlay */}
      <View style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Corner brackets */}
        <View style={{ position: 'absolute', top: '8%', left: '6%', width: 28, height: 28, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: COLORS.sage, opacity: 0.9 }} />
        <View style={{ position: 'absolute', top: '8%', right: '6%', width: 28, height: 28, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: COLORS.sage, opacity: 0.9 }} />
        <View style={{ position: 'absolute', bottom: '30%', left: '6%', width: 28, height: 28, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: COLORS.sage, opacity: 0.9 }} />
        <View style={{ position: 'absolute', bottom: '30%', right: '6%', width: 28, height: 28, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderColor: COLORS.sage, opacity: 0.9 }} />
        {/* Scan line */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: '6%',
              right: '6%',
              height: 1.5,
              backgroundColor: COLORS.sage,
              opacity: 0.55,
            },
            scanLineStyle,
          ]}
        />
      </View>

      {/* Top bar */}
      <Animated.View
        entering={FadeIn.delay(100).duration(300)}
        style={{
          position: 'absolute',
          top: top + 14,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.cream} />
        </TouchableOpacity>

        <View style={[{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 }]}>
          <Text style={{ color: COLORS.sage, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
            {location ? '● LOCATION LOCKED' : '○ LOCATING…'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowPanel((v) => !v)}
          accessibilityLabel="Toggle species panel"
          accessibilityRole="button"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: showPanel ? COLORS.sage : 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="list-outline" size={20} color={showPanel ? COLORS.ink : COLORS.cream} />
        </TouchableOpacity>
      </Animated.View>

      {/* Selected species overlay card */}
      {selected && (
        <Animated.View
          entering={SlideInDown.springify().damping(16).stiffness(200)}
          exiting={FadeOutDown}
          style={{
            position: 'absolute',
            bottom: bottom + (showPanel ? 320 : 20),
            left: 16,
            right: 16,
          }}
        >
          <View
            style={[
              {
                backgroundColor: 'rgba(20, 12, 8, 0.88)',
                borderRadius: 18,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
                borderWidth: 1,
                borderColor: COLORS.sage,
              },
              softShadow(0.4, 20, 8),
            ]}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                backgroundColor: COLORS.sage,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <SpeciesIcon kind={selected.kind} size={34} color={COLORS.cream} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>
                {selected.commonName}
              </Text>
              <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 12, marginTop: 1 }}>
                {selected.latin}
              </Text>
              <Text style={{ color: COLORS.sage, fontSize: 12, marginTop: 6, lineHeight: 17 }}>
                ID tip: {selected.tip}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelected(null)}
              style={{ padding: 4 }}
            >
              <Ionicons name="close" size={18} color={COLORS.bark} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Species candidates panel */}
      {showPanel && (
        <Animated.View
          entering={SlideInDown.springify().damping(16).stiffness(180)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 300 + bottom,
            backgroundColor: 'rgba(10, 6, 4, 0.92)',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ color: COLORS.cream, fontSize: 16, fontWeight: '700' }}>
              What to look for now
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 2 }}>
              Active species in your area this season — tap to pin ID tips on screen
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom + 16, gap: 10 }}
          >
            {candidates.map((sp, i) => (
              <Animated.View
                key={sp.id}
                entering={FadeInDown.delay(i * 50).springify().damping(15)}
              >
                <TouchableOpacity
                  onPress={() => setSelected(selected?.id === sp.id ? null : sp)}
                  accessibilityLabel={sp.commonName}
                  accessibilityRole="button"
                  style={[
                    {
                      width: 110,
                      borderRadius: 16,
                      padding: 12,
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: selected?.id === sp.id
                        ? 'rgba(156, 171, 135, 0.25)'
                        : 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: selected?.id === sp.id ? COLORS.sage : 'rgba(255,255,255,0.1)',
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 13,
                      backgroundColor: selected?.id === sp.id ? COLORS.sage : 'rgba(255,255,255,0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SpeciesIcon kind={sp.kind} size={32} color={COLORS.cream} />
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: selected?.id === sp.id ? COLORS.sage : COLORS.cream,
                      fontSize: 11,
                      fontWeight: '700',
                      textAlign: 'center',
                      lineHeight: 15,
                    }}
                  >
                    {sp.commonName}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Hint label when panel closed */}
      {!showPanel && !selected && (
        <Animated.View
          entering={FadeIn.delay(600).duration(400)}
          style={{ position: 'absolute', bottom: bottom + 24, left: 0, right: 0, alignItems: 'center' }}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ color: COLORS.cream, fontSize: 13, fontWeight: '500', letterSpacing: 0.2 }}>
              Tap ≡ to see what&apos;s active nearby
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
