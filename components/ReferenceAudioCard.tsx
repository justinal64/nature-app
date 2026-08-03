import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { COLORS, softShadow } from '@/constants/AppTheme';
import type { Species } from '@/constants/catalog';
import { fetchReferenceAudio, speciesHasReferenceAudio, type ReferenceAudioResult } from '@/lib/species-audio';

type LoadState = 'idle' | 'loading' | 'ready' | 'unavailable';

export function ReferenceAudioCard({ species }: { species: Species }) {
  const [state, setState] = useState<LoadState>('idle');
  const [audio, setAudio] = useState<ReferenceAudioResult | null>(null);
  const player = useAudioPlayer(audio ? { uri: audio.localUri } : undefined);
  const status = useAudioPlayerStatus(player);

  if (!speciesHasReferenceAudio(species)) return null;

  async function handlePress() {
    if (audio) {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
      return;
    }
    setState('loading');
    const result = await fetchReferenceAudio(species);
    if (!result) {
      setState('unavailable');
      return;
    }
    setAudio(result);
    setState('ready');
  }

  const label = species.kind === 'bird' ? 'call' : 'sound';

  return (
    <Animated.View
      entering={FadeInDown.delay(160).duration(280)}
      style={[
        { marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.granite },
        softShadow(0.04, 6, 2),
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.lichen, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="volume-high-outline" size={17} color={COLORS.ink} />
        </View>
        <Text style={{ color: COLORS.granite, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Reference {label === 'call' ? 'Call' : 'Sound'}
        </Text>
      </View>

      <Pressable
        onPress={handlePress}
        disabled={state === 'loading'}
        accessibilityRole="button"
        accessibilityLabel={audio ? (status.playing ? `Pause ${label}` : `Play ${label}`) : `Load ${label} preview`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lichen, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons
            name={state === 'loading' ? 'hourglass-outline' : audio && status.playing ? 'pause' : 'play'}
            size={18}
            color={COLORS.bone}
          />
        </View>
        <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600' }}>
          {state === 'loading'
            ? 'Loading…'
            : audio
              ? status.playing
                ? 'Playing…'
                : `Play ${label}`
              : `Preview ${label}`}
        </Text>
      </Pressable>

      {state === 'unavailable' && (
        <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 10, lineHeight: 17 }}>
          No {label} preview available right now — this needs a connection the first time to fetch a recording, or this species may not have one on file.
        </Text>
      )}

      {audio && (
        <Pressable onPress={() => Linking.openURL(audio.sourceUrl)} accessibilityRole="link" style={{ marginTop: 10 }}>
          <Text style={{ color: COLORS.granite, fontSize: 11 }}>
            Recording by {audio.recordist} via xeno-canto (CC) · View source
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
