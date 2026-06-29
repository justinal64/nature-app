import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountUp } from '@/components/CountUp';
import { LandscapeHeader } from '@/components/LandscapeHeader';
import { PressableScale } from '@/components/PressableScale';
import { Reveal } from '@/components/Reveal';
import { SpeciesIcon, SpeciesKind } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { getEarnedBadges } from '@/lib/badges';
import {
  cancelSpeciesOfTheDay,
  cancelStreakReminder,
  getScheduledReminders,
  requestNotificationPermission,
  scheduleSpeciesOfTheDay,
  scheduleStreakReminder,
} from '@/lib/notifications';
import { getUserFriendlyError } from '@/utils/errors';
import { useSightings } from '@/hooks/useSightings';
import { useStreak } from '@/hooks/useStreak';
import { formatRelativeDate } from '@/utils/date';

function getInitial(user: { displayName?: string | null; email?: string | null }) {
  const name = user.displayName?.trim();
  if (name) return name.charAt(0).toUpperCase();
  return user.email?.charAt(0).toUpperCase() ?? '?';
}

function getJoinedLabel(metadata?: { creationTime?: string }) {
  const ts = metadata?.creationTime;
  if (!ts) return 'New explorer';
  const d = new Date(ts);
  return `Joined ${d.toLocaleString('en-US', { month: 'short', year: 'numeric' })}`;
}

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut, deleteAccount, refreshUser } = useAuth();
  const { sightings } = useSightings(user?.uid);
  const streak = useStreak(user?.uid);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Naturalist';
  const initial = user ? getInitial(user) : '?';
  const joinedLabel = getJoinedLabel(user?.metadata);

  const speciesCount = new Set(sightings.map((s) => s.speciesId)).size;
  const photoCount = sightings.filter((s) => s.photoUri).length;
  const recentEntries = sightings.slice(0, 3);
  const earnedBadges = getEarnedBadges(sightings, streak);

  const STATS = [
    { value: speciesCount, suffix: '', label: 'Species' },
    { value: photoCount, suffix: '', label: 'Photos' },
    { value: streak, suffix: 'd', label: 'Streak' },
    { value: earnedBadges.length, suffix: '', label: 'Badges' },
  ];

  const [notificationsOn, setNotificationsOn] = useState(false);
  const [sotdOn, setSotdOn] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    getScheduledReminders().then(({ streak, sotd }) => {
      setNotificationsOn(streak);
      setSotdOn(sotd);
    }).catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
    } catch {
      setDeleteError('Incorrect password. Please try again.');
      setDeleting(false);
    }
  };

  async function handleSaveName() {
    const trimmed = newName.trim();
    if (!trimmed || !user) return;
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: trimmed });
      await refreshUser();
      setShowEditName(false);
    } catch {
      Alert.alert('Error', 'Could not update your name. Please try again.');
    } finally {
      setSavingName(false);
    }
  }

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          signOut().catch((e) => Alert.alert('Error', getUserFriendlyError(e)));
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LandscapeHeader height={220} />

      <ScrollView
        contentContainerStyle={{ paddingTop: top + 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <View
              style={[
                {
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: COLORS.dusk,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: COLORS.cream,
                },
                glow(COLORS.dusk, 10),
              ]}
            >
              <Text style={{ color: COLORS.cream, fontSize: 32, fontWeight: '700' }}>
                {initial}
              </Text>
            </View>
          </Animated.View>
          <Reveal delay={80} style={{ flex: 1 }}>
            <Pressable
              onPress={() => { setNewName(displayName); setShowEditName(true); }}
              accessibilityLabel={`Edit display name, currently ${displayName}`}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text style={{ color: COLORS.ink, fontSize: 22, fontWeight: '700' }}>
                {displayName}
              </Text>
              <Ionicons name="pencil-outline" size={14} color={COLORS.bark} />
            </Pressable>
            <Text style={{ color: COLORS.bark, fontSize: 13, marginTop: 2 }}>{joinedLabel}</Text>
          </Reveal>
          <PressableScale
            onPress={confirmSignOut}
            scaleTo={0.9}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: COLORS.cream,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.sand,
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.ink} />
          </PressableScale>
        </View>

        <Reveal delay={120}>
          <View
            style={[
              {
                marginHorizontal: 20,
                marginTop: 22,
                backgroundColor: COLORS.surface,
                borderRadius: 18,
                padding: 16,
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: COLORS.sand,
              },
              softShadow(0.05, 8, 2),
            ]}
          >
            {STATS.map((stat, i) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderLeftWidth: i === 0 ? 0 : 1,
                  borderLeftColor: COLORS.sand,
                }}
              >
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  delay={250 + i * 120}
                  style={{ color: COLORS.ink, fontSize: 20, fontWeight: '700' }}
                />
                <Text
                  style={{
                    color: COLORS.bark,
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.4,
                    marginTop: 2,
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Reveal>

        <Reveal delay={200}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginTop: 28,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '700' }}>
              Badges
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 13 }}>
              {earnedBadges.length}/{earnedBadges.length + (16 - earnedBadges.length)} earned
            </Text>
          </View>
        </Reveal>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 4 }}
        >
          {earnedBadges.length === 0 ? (
            <View style={{ paddingVertical: 12, paddingHorizontal: 4 }}>
              <Text style={{ color: COLORS.bark, fontSize: 13 }}>
                Log your first sighting to earn a badge.
              </Text>
            </View>
          ) : (
            earnedBadges.map((badge, i) => (
              <Animated.View
                key={badge.id}
                entering={ZoomIn.delay(260 + i * 90).springify().damping(11).stiffness(180)}
                style={{ width: 100, alignItems: 'center' }}
              >
                <Pressable
                  onPress={() => Alert.alert(badge.name, badge.description)}
                  style={{ alignItems: 'center' }}
                >
                  <View
                    style={[
                      {
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: COLORS.sage,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 3,
                        borderColor: COLORS.gold,
                      },
                      glow(COLORS.gold, 8),
                    ]}
                  >
                    <SpeciesIcon kind={badge.kind} size={42} color={COLORS.cream} />
                  </View>
                  <Text
                    style={{
                      color: COLORS.ink,
                      fontSize: 12,
                      fontWeight: '600',
                      marginTop: 8,
                      textAlign: 'center',
                    }}
                  >
                    {badge.name}
                  </Text>
                </Pressable>
              </Animated.View>
            ))
          )}
        </ScrollView>

        <Reveal delay={320}>
          <View style={{ paddingHorizontal: 24, marginTop: 28, marginBottom: 12 }}>
            <Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '700' }}>
              Recent entries
            </Text>
          </View>
        </Reveal>

        <Reveal delay={380}>
          <View
            style={[
              {
                marginHorizontal: 20,
                backgroundColor: COLORS.surface,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: COLORS.sand,
                overflow: 'hidden',
              },
              softShadow(0.04, 6, 2),
            ]}
          >
            {recentEntries.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: COLORS.bark, fontSize: 14 }}>No entries yet</Text>
              </View>
            ) : (
              recentEntries.map((entry, i) => (
                <Pressable
                  key={entry.id}
                  onPress={() => router.push(`/species/${entry.speciesId}` as never)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    gap: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: COLORS.sand,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: COLORS.sage,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SpeciesIcon kind={entry.kind as SpeciesKind} size={28} color={COLORS.cream} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>
                      {entry.commonName}
                    </Text>
                    <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
                      {formatRelativeDate(entry.capturedAt)}
                    </Text>
                  </View>
                  <Text style={{ color: COLORS.bark, fontSize: 18 }}>›</Text>
                </Pressable>
              ))
            )}
          </View>
        </Reveal>

        <Animated.View entering={FadeInDown.delay(420).duration(400)}>
          <Pressable
            onPress={async () => {
              if (notificationsOn) {
                await cancelStreakReminder();
                setNotificationsOn(false);
              } else {
                const granted = await requestNotificationPermission();
                if (granted) {
                  await scheduleStreakReminder(user!.uid, streak);
                  setNotificationsOn(true);
                } else {
                  Alert.alert(
                    'Notifications blocked',
                    'Go to Settings → WildLens → Notifications to enable streak reminders.',
                  );
                }
              }
            }}
            accessibilityRole="switch"
            accessibilityLabel="Streak reminders"
            accessibilityState={{ checked: notificationsOn }}
            style={{
              marginTop: 28,
              marginHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.sand,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.ink} />
              <View>
                <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 15 }}>
                  Streak reminders
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
                  Daily nudge at 7 PM if you haven&apos;t logged a sighting
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: notificationsOn ? COLORS.sage : COLORS.sand,
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: COLORS.cream,
                  alignSelf: notificationsOn ? 'flex-end' : 'flex-start',
                }}
              />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(432).duration(400)}>
          <Pressable
            onPress={async () => {
              if (sotdOn) {
                await cancelSpeciesOfTheDay();
                setSotdOn(false);
              } else {
                const granted = await requestNotificationPermission();
                if (granted) {
                  await scheduleSpeciesOfTheDay();
                  setSotdOn(true);
                } else {
                  Alert.alert(
                    'Notifications blocked',
                    'Go to Settings → WildLens → Notifications to enable species-of-the-day.',
                  );
                }
              }
            }}
            accessibilityRole="switch"
            accessibilityLabel="Species of the day"
            accessibilityState={{ checked: sotdOn }}
            style={{
              marginTop: 10,
              marginHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: COLORS.sand,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="sunny-outline" size={20} color={COLORS.ink} />
              <View>
                <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 15 }}>
                  Species of the day
                </Text>
                <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 1 }}>
                  Daily featured species at 8 AM
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: sotdOn ? COLORS.sage : COLORS.sand,
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: COLORS.cream,
                  alignSelf: sotdOn ? 'flex-end' : 'flex-start',
                }}
              />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(445).duration(400)}>
          <Pressable
            onPress={() => router.push('/favorites' as never)}
            accessibilityLabel="View favorites"
            accessibilityRole="button"
            style={[
              {
                marginHorizontal: 20,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: COLORS.sand,
                gap: 12,
              },
              softShadow(0.04, 5, 1),
            ]}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: COLORS.cream,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="heart" size={18} color={COLORS.clay} />
            </View>
            <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '600', fontSize: 15 }}>Favorites</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.bark} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(440).duration(400)}>
          <Pressable
            onPress={() => router.push('/privacy-policy' as never)}
            style={{ marginTop: 28, alignItems: 'center', paddingVertical: 10 }}
          >
            <Text style={{ color: COLORS.bark, fontSize: 13, fontWeight: '500' }}>
              Privacy Policy
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <Text style={{ color: COLORS.sand, fontSize: 12, textAlign: 'center', paddingVertical: 4 }}>
            WildLens 1.0.0
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(460).duration(400)}>
          <Pressable
            onPress={() => {
              Alert.alert(
                'Delete account',
                'This is permanent. Your sightings, journal entries, and badges will be removed.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Continue',
                    style: 'destructive',
                    onPress: () => setShowDeleteModal(true),
                  },
                ],
              );
            }}
            style={{ marginTop: 24, marginBottom: 8, alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ color: COLORS.clay, fontSize: 14, fontWeight: '600' }}>
              Delete account
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeletePassword('');
          setDeleteError('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 20,
                padding: 24,
              }}
            >
              <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '700', marginBottom: 6 }}>
                Confirm deletion
              </Text>
              <Text style={{ color: COLORS.bark, fontSize: 14, lineHeight: 20, marginBottom: 20 }}>
                Enter your password to permanently delete your account.
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: deleteError ? COLORS.clay : COLORS.sand,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: COLORS.surface,
                  marginBottom: deleteError ? 8 : 20,
                }}
              >
                <TextInput
                  value={deletePassword}
                  onChangeText={(t) => {
                    setDeletePassword(t);
                    setDeleteError('');
                  }}
                  placeholder="Password"
                  placeholderTextColor={COLORS.bark}
                  secureTextEntry
                  autoFocus
                  style={{ color: COLORS.ink, fontSize: 15 }}
                />
              </View>
              {deleteError ? (
                <Text style={{ color: COLORS.clay, fontSize: 12, marginBottom: 16 }}>
                  {deleteError}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: COLORS.sand,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.ink, fontWeight: '600' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: COLORS.clay,
                    alignItems: 'center',
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: COLORS.cream, fontWeight: '700' }}>
                    {deleting ? 'Deleting…' : 'Delete'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit display name modal */}
      <Modal
        visible={showEditName}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditName(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          onPress={() => setShowEditName(false)}
        >
          <Pressable
            onPress={() => {}}
            style={[{ backgroundColor: COLORS.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }, softShadow(0.18, 20, 8)]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Edit display name</Text>
              <Pressable onPress={() => setShowEditName(false)} accessibilityLabel="Cancel" accessibilityRole="button">
                <Ionicons name="close" size={22} color={COLORS.bark} />
              </Pressable>
            </View>
            <View style={{ borderWidth: 1, borderColor: COLORS.sand, borderRadius: 14, padding: 14, backgroundColor: COLORS.surface, marginBottom: 20 }}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Your name"
                placeholderTextColor={COLORS.bark}
                autoFocus
                maxLength={40}
                style={{ color: COLORS.ink, fontSize: 16 }}
                accessibilityLabel="Display name"
              />
            </View>
            <Pressable
              onPress={handleSaveName}
              disabled={savingName || !newName.trim()}
              accessibilityLabel="Save name"
              accessibilityRole="button"
              style={[{ backgroundColor: newName.trim() ? COLORS.clay : COLORS.sand, borderRadius: 24, paddingVertical: 16, alignItems: 'center' }, newName.trim() ? glow(COLORS.clay, 8) : {}]}
            >
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>
                {savingName ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
