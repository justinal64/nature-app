import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Line } from 'react-native-svg';

import { COLORS, glow } from '@/constants/AppTheme';
import type { IdentifyResult } from '@/lib/identify';
import { identifyFromPhoto } from '@/lib/local-identify';

// How often to sample the live preview for a "looks like X" hint. Throttled
// deliberately — this runs the same on-device TFLite classifier the shutter
// press uses, so tighter intervals mean more heat/battery for a preview
// that's discarded on the next capture-shutter identification anyway.
const PREVIEW_INTERVAL_MS = 2200;
// Below this the guess is too shaky to show as a live hint (result.tsx uses
// the same 50 cutoff to gate saving; previews get a bit more slack since
// they're just a hint, not a save).
const PREVIEW_CONFIDENCE_THRESHOLD = 35;

export default function CaptureScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [capturing, setCapturing] = useState(false);
  const [previewGuess, setPreviewGuess] = useState<IdentifyResult | null>(null);
  const capturingRef = useRef(false);
  const previewBusyRef = useRef(false);

  useEffect(() => {
    capturingRef.current = capturing;
  }, [capturing]);

  // Live viewfinder hint: periodically grab a lightweight frame and run it
  // through the same on-device classifier the shutter uses, entirely
  // offline. Skips a tick (rather than queuing) if the previous one hasn't
  // finished, so a slow device just shows hints less often instead of
  // falling behind — and clears the hint if a sample doesn't identify
  // anything, so a stale guess never lingers once it's no longer relevant.
  useEffect(() => {
    if (!permission?.granted) return;
    const interval = setInterval(async () => {
      if (capturingRef.current || previewBusyRef.current || !cameraRef.current) return;
      previewBusyRef.current = true;
      let uri: string | undefined;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.2,
          skipProcessing: true,
          shutterSound: false,
        });
        uri = photo?.uri;
        if (uri) {
          const results = await identifyFromPhoto(uri);
          const top = results[0];
          const good = top && !top.isOffline && top.confidence >= PREVIEW_CONFIDENCE_THRESHOLD;
          setPreviewGuess(good ? top : null);
        }
      } catch {
        setPreviewGuess(null);
      } finally {
        if (uri) {
          FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
        }
        previewBusyRef.current = false;
      }
    }, PREVIEW_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [permission?.granted]);

  async function takePicture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    setPreviewGuess(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) {
        router.replace({ pathname: '/result', params: { photoUri: photo.uri } });
      }
    } finally {
      setCapturing(false);
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.85,
    });
    if (!result.canceled) {
      router.replace({ pathname: '/result', params: { photoUri: result.assets[0].uri } });
    }
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: COLORS.ink }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.ink,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 36,
        }}
      >
        <Ionicons name="camera-outline" size={52} color={COLORS.bone} />
        <Text
          style={{
            color: COLORS.bone,
            fontSize: 20,
            fontWeight: '700',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          Camera access needed
        </Text>
        <Text
          style={{
            color: COLORS.granite,
            fontSize: 15,
            marginTop: 10,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          WildLens uses your camera to identify plants and animals.
        </Text>
        {permission.canAskAgain ? (
          <Pressable
            onPress={requestPermission}
            style={{
              marginTop: 28,
              backgroundColor: COLORS.lichen,
              borderRadius: 24,
              paddingVertical: 14,
              paddingHorizontal: 32,
            }}
          >
            <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 15 }}>
              Allow Camera
            </Text>
          </Pressable>
        ) : (
          <Text
            style={{ color: COLORS.granite, fontSize: 13, marginTop: 20, textAlign: 'center' }}
          >
            Go to Settings → WildLens → Camera to enable access.
          </Text>
        )}
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.granite, fontSize: 15 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} flash={flash} />

      {/* Reticle corners */}
      <View style={{ position: 'absolute', inset: 0 }}>
        <Svg width="100%" height="100%" viewBox="0 0 393 752">
          <G stroke={COLORS.bone} strokeWidth={2.5} fill="none" opacity={0.9}>
            <Line x1={60} y1={top + 150} x2={92} y2={top + 150} />
            <Line x1={60} y1={top + 150} x2={60} y2={top + 182} />
            <Line x1={333} y1={top + 150} x2={301} y2={top + 150} />
            <Line x1={333} y1={top + 150} x2={333} y2={top + 182} />
            <Line x1={60} y1={top + 460} x2={92} y2={top + 460} />
            <Line x1={60} y1={top + 460} x2={60} y2={top + 428} />
            <Line x1={333} y1={top + 460} x2={301} y2={top + 460} />
            <Line x1={333} y1={top + 460} x2={333} y2={top + 428} />
          </G>
        </Svg>
      </View>

      {/* Top bar */}
      <View
        style={{
          position: 'absolute',
          top: top + 16,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: 'rgba(10, 10, 24, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close" size={22} color={COLORS.bone} />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => router.push('/field-cam' as never)}
            accessibilityLabel="Open field cam with AR overlays"
            accessibilityRole="button"
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="layers-outline" size={20} color={COLORS.bone} />
          </Pressable>
          <Pressable
            onPress={() => setFlash(f => (f === 'off' ? 'on' : 'off'))}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor:
                flash === 'on' ? COLORS.lichen : 'rgba(10, 10, 24, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-outline'}
              size={20}
              color={COLORS.bone}
            />
          </Pressable>
          <Pressable
            onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: 'rgba(10, 10, 24, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="sync-outline" size={20} color={COLORS.bone} />
          </Pressable>
        </View>
      </View>

      {/* Hint pill */}
      <View
        style={{
          position: 'absolute',
          top: '36%',
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(10, 10, 24, 0.55)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 18,
          }}
        >
          <Text
            style={{
              color: COLORS.bone,
              fontSize: 13,
              fontWeight: '500',
              letterSpacing: 0.3,
            }}
          >
            Center the subject — hold steady
          </Text>
        </View>
      </View>

      {/* Live "looks like X" hint */}
      {previewGuess && !capturing && (
        <View
          style={{
            position: 'absolute',
            bottom: bottom + 120,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(10, 10, 24, 0.55)',
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 18,
            }}
          >
            <Ionicons name="sparkles-outline" size={14} color={COLORS.lichen} />
            <Text style={{ color: COLORS.bone, fontSize: 13, fontWeight: '600', letterSpacing: 0.2 }}>
              Looks like {previewGuess.commonName}
            </Text>
            <Text style={{ color: COLORS.lichen, fontSize: 12, fontWeight: '700' }}>
              {previewGuess.confidence}%
            </Text>
          </View>
        </View>
      )}

      {/* Bottom controls */}
      <View
        style={{
          position: 'absolute',
          bottom: bottom + 28,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 36,
        }}
      >
        <Pressable
          onPress={pickFromGallery}
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: 'rgba(10, 10, 24, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="images-outline" size={24} color={COLORS.bone} />
        </Pressable>

        <TouchableOpacity
          onPress={takePicture}
          disabled={capturing}
          activeOpacity={0.8}
          accessibilityLabel="Take picture"
          accessibilityRole="button"
          style={[
            {
              width: 78,
              height: 78,
              borderRadius: 39,
              borderWidth: 5,
              borderColor: COLORS.bone,
              backgroundColor: 'rgba(244, 236, 218, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: capturing ? 0.6 : 1,
            },
            glow(COLORS.bone, 12),
          ]}
        >
          {capturing ? (
            <ActivityIndicator color={COLORS.bone} />
          ) : (
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: COLORS.bone,
              }}
            />
          )}
        </TouchableOpacity>

        <Pressable
          onPress={() => router.push('/sound-id' as never)}
          accessibilityLabel="Identify a bird by sound"
          accessibilityRole="button"
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: 'rgba(10, 10, 24, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="mic-outline" size={24} color={COLORS.bone} />
        </Pressable>
      </View>
    </View>
  );
}
