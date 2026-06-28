import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/AppTheme';

const LAST_UPDATED = 'June 27, 2026';

type SectionProps = { title: string; children: React.ReactNode };

function Section({ title, children }: SectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          color: COLORS.clay,
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: string }) {
  return (
    <Text style={{ color: COLORS.ink, fontSize: 15, lineHeight: 23 }}>{children}</Text>
  );
}

export default function PrivacyPolicyScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          paddingTop: top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: COLORS.sand,
          backgroundColor: COLORS.background,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={{ color: COLORS.clay, fontSize: 17 }}>‹</Text>
        </Pressable>
        <Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '700', flex: 1 }}>
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: COLORS.bark, fontSize: 13, marginBottom: 28 }}>
          Last updated {LAST_UPDATED}
        </Text>

        <Section title="What we collect">
          <Body>
            {
              'When you create a WildLens account we collect your email address and, optionally, a display name. These are stored by Firebase Authentication (Google) and are used only to identify your account within the app. We do not sell or share this information with advertisers.'
            }
          </Body>
        </Section>

        <Section title="What stays on your device">
          <Body>
            {
              'Species sightings, journal entries, photos, and favorites are stored locally on your device. This data never leaves your device and is not uploaded to any server. Deleting the app removes all of it permanently.'
            }
          </Body>
        </Section>

        <Section title="Camera and photos">
          <Body>
            {
              'When you photograph a plant or animal to identify it, the image is processed entirely on your device. No photos are transmitted to external servers.'
            }
          </Body>
        </Section>

        <Section title="Third-party services">
          <Body>
            {
              'WildLens uses Firebase Authentication (by Google) for account creation and sign-in. Firebase may collect certain device and usage signals as described in their Privacy Policy at firebase.google.com/support/privacy.\n\nNo advertising, analytics, or tracking SDKs are included in the app.'
            }
          </Body>
        </Section>

        <Section title="Data deletion">
          <Body>
            {
              "You can permanently delete your WildLens account from the Profile screen. This removes your Firebase Auth record immediately. Your on-device sightings and favorites remain on the device until you delete the app — they are not linked to any server record."
            }
          </Body>
        </Section>

        <Section title="Contact">
          <Body>{'Questions about this policy? Email us at justinal8183@gmail.com.'}</Body>
        </Section>
      </ScrollView>
    </View>
  );
}
