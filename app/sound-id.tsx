import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { cancelStreakReminder } from '@/lib/notifications';
import { addSighting } from '@/lib/sightings';
import {
  identifyBirdSound,
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  type SoundIdResult,
} from '@/lib/sound-id';

type Phase = 'idle' | 'recording' | 'analyzing' | 'results';

const MAX_RECORD_SECONDS = 10;

export default function SoundIdScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<SoundIdResult[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(MAX_RECORD_SECONDS);
  const [saving, setSaving] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    if (phase === 'recording') {
      pulse.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
      ring1.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
      ring2.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      pulse.value = 0;
      ring1.value = 0;
      ring2.value = 0;
    }
  }, [phase, pulse, ring1, ring2]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring1.value * 0.8 }],
    opacity: 0.5 * (1 - ring1.value),
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring2.value * 1.4 }],
    opacity: 0.3 * (1 - ring2.value),
  }));

  async function handleRecord() {
    if (phase !== 'idle') return;

    const granted = await requestMicrophonePermission();
    if (!granted) {
      Alert.alert('Microphone needed', 'Allow microphone access in Settings to use Sound ID.');
      return;
    }

    setSecondsLeft(MAX_RECORD_SECONDS);
    setPhase('recording');

    try {
      await startRecording();
    } catch {
      Alert.alert('Error', 'Could not start recording. Please try again.');
      setPhase('idle');
      return;
    }

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setSecondsLeft(MAX_RECORD_SECONDS - elapsed);
      if (elapsed >= MAX_RECORD_SECONDS) {
        finishRecording();
      }
    }, 1000);
  }

  async function finishRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('analyzing');

    const uri = await stopRecording();
    if (!uri) {
      setPhase('idle');
      return;
    }

    try {
      const res = await identifyBirdSound(uri);
      setResults(res);
      setPhase('results');
    } catch {
      Alert.alert('Error', 'Could not analyze the recording. Please try again.');
      setPhase('idle');
    }
  }

  async function saveSighting(result: SoundIdResult) {
    if (!user) return;
    setSaving(result.species.id);
    try {
      await addSighting({
        userId: user.uid,
        speciesId: result.species.id,
        commonName: result.species.commonName,
        latinName: result.species.latin,
        kind: 'bird',
        capturedAt: new Date().toISOString(),
      });
      cancelStreakReminder().catch(() => {});
      Alert.alert('Saved!', `${result.species.commonName} added to your journal.`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)/journal') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save sighting.');
    } finally {
      setSaving(null);
    }
  }

  const isOfflineMode = results.length > 0 && results[0].isOffline;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.ink }}>
      {/* Back button */}
      <Animated.View
        entering={FadeIn.delay(100).duration(300)}
        style={{ position: 'absolute', top: top + 14, left: 16, zIndex: 10 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.cream} />
        </TouchableOpacity>
      </Animated.View>

      {phase !== 'results' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.Text
            entering={FadeIn.delay(150).duration(400)}
            style={{ color: COLORS.cream, fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}
          >
            {phase === 'idle' ? 'Sound ID' : phase === 'recording' ? 'Listening…' : 'Analyzing…'}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(200).duration(400)}
            style={{ color: COLORS.bark, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 60 }}
          >
            {phase === 'idle'
              ? 'Hold up your phone and tap to record a bird call. Works offline.'
              : phase === 'recording'
              ? `${secondsLeft}s remaining — keep the bird in earshot`
              : 'Matching against catalog…'}
          </Animated.Text>

          {/* Ripple rings + mic button */}
          <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
            {phase === 'recording' && (
              <>
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: 160,
                      height: 160,
                      borderRadius: 80,
                      backgroundColor: COLORS.clay,
                    },
                    ring1Style,
                  ]}
                />
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      width: 160,
                      height: 160,
                      borderRadius: 80,
                      backgroundColor: COLORS.clay,
                    },
                    ring2Style,
                  ]}
                />
              </>
            )}
            <Animated.View style={[pulseStyle]}>
              <Pressable
                onPress={phase === 'idle' ? handleRecord : phase === 'recording' ? finishRecording : undefined}
                disabled={phase === 'analyzing'}
                style={[
                  {
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    backgroundColor: phase === 'recording' ? COLORS.clay : 'rgba(255,255,255,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: phase === 'recording' ? COLORS.clay : COLORS.cream,
                  },
                  phase === 'recording' ? glow(COLORS.clay, 16) : {},
                ]}
              >
                <Ionicons
                  name={phase === 'recording' ? 'stop' : 'mic'}
                  size={44}
                  color={COLORS.cream}
                />
              </Pressable>
            </Animated.View>
          </View>

          {phase === 'recording' && (
            <Animated.Text
              entering={FadeIn.duration(300)}
              style={{ color: COLORS.bark, fontSize: 13, marginTop: 32, textAlign: 'center' }}
            >
              Tap to stop early
            </Animated.Text>
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: top + 70, paddingHorizontal: 24, paddingBottom: 16 }}>
            <Text style={{ color: COLORS.cream, fontSize: 24, fontWeight: '700' }}>
              {isOfflineMode ? 'Which bird did you hear?' : 'Best matches'}
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
              {isOfflineMode
                ? 'No connection — showing birds active in your region this season. Tap the one you heard.'
                : 'Tap a result to save it to your journal.'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottom + 24, gap: 10 }}>
            {results.map((r, i) => (
              <Animated.View
                key={r.species.id}
                entering={FadeInDown.delay(i * 70).springify().damping(15).stiffness(150)}
              >
                <Pressable
                  onPress={() => saveSighting(r)}
                  disabled={saving === r.species.id}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      borderRadius: 16,
                      padding: 14,
                      gap: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                      opacity: saving && saving !== r.species.id ? 0.4 : 1,
                    },
                    saving === r.species.id ? glow(COLORS.clay, 10) : {},
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
                    }}
                  >
                    <SpeciesIcon kind="bird" size={34} color={COLORS.cream} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>
                      {r.species.commonName}
                    </Text>
                    <Text style={{ color: COLORS.bark, fontStyle: 'italic', fontSize: 13, marginTop: 1 }}>
                      {r.species.latin}
                    </Text>
                    {!isOfflineMode && (
                      <View
                        style={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          marginTop: 8,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            height: '100%',
                            width: `${r.confidence}%`,
                            borderRadius: 2,
                            backgroundColor: r.confidence >= 50 ? COLORS.sage : COLORS.clay,
                          }}
                        />
                      </View>
                    )}
                  </View>
                  {!isOfflineMode && (
                    <Text style={{ color: COLORS.bark, fontWeight: '700', fontSize: 14 }}>
                      {r.confidence}%
                    </Text>
                  )}
                  <Ionicons
                    name={saving === r.species.id ? 'checkmark-circle' : 'add-circle-outline'}
                    size={24}
                    color={saving === r.species.id ? COLORS.sage : COLORS.bark}
                  />
                </Pressable>
              </Animated.View>
            ))}

            <Pressable
              onPress={() => { setPhase('idle'); setResults([]); }}
              style={[
                {
                  marginTop: 8,
                  paddingVertical: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                },
                softShadow(0, 0, 0),
              ]}
            >
              <Text style={{ color: COLORS.bark, fontWeight: '600', fontSize: 15 }}>Record again</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
