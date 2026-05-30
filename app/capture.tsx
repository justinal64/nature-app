import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Line } from 'react-native-svg';

import { COLORS, glow } from '@/constants/AppTheme';

export default function CaptureScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [capturing, setCapturing] = useState(false);

  async function takePicture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
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
        <Ionicons name="camera-outline" size={52} color={COLORS.cream} />
        <Text
          style={{
            color: COLORS.cream,
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
            color: COLORS.bark,
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
              backgroundColor: COLORS.clay,
              borderRadius: 24,
              paddingVertical: 14,
              paddingHorizontal: 32,
            }}
          >
            <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>
              Allow Camera
            </Text>
          </Pressable>
        ) : (
          <Text
            style={{ color: COLORS.bark, fontSize: 13, marginTop: 20, textAlign: 'center' }}
          >
            Go to Settings → WildLens → Camera to enable access.
          </Text>
        )}
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.bark, fontSize: 15 }}>Go back</Text>
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
          <G stroke={COLORS.cream} strokeWidth={2.5} fill="none" opacity={0.9}>
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
          <Ionicons name="close" size={22} color={COLORS.cream} />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => setFlash(f => (f === 'off' ? 'on' : 'off'))}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor:
                flash === 'on' ? COLORS.gold : 'rgba(10, 10, 24, 0.45)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-outline'}
              size={20}
              color={COLORS.cream}
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
            <Ionicons name="sync-outline" size={20} color={COLORS.cream} />
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
              color: COLORS.cream,
              fontSize: 13,
              fontWeight: '500',
              letterSpacing: 0.3,
            }}
          >
            Center the subject — hold steady
          </Text>
        </View>
      </View>

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
          <Ionicons name="images-outline" size={24} color={COLORS.cream} />
        </Pressable>

        <Pressable
          onPress={takePicture}
          disabled={capturing}
          style={({ pressed }) => [
            {
              width: 78,
              height: 78,
              borderRadius: 39,
              borderWidth: 5,
              borderColor: COLORS.cream,
              backgroundColor: 'rgba(244, 236, 218, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
              opacity: capturing ? 0.6 : 1,
            },
            glow(COLORS.cream, 12),
          ]}
        >
          {capturing ? (
            <ActivityIndicator color={COLORS.cream} />
          ) : (
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: COLORS.cream,
              }}
            />
          )}
        </Pressable>

        {/* Spacer keeps the shutter centred */}
        <View style={{ width: 50 }} />
      </View>
    </View>
  );
}
