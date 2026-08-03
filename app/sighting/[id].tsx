import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpeciesIcon } from '@/components/SpeciesIcon';
import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { CATALOG, getSpeciesById, type Species } from '@/constants/catalog';
import { useAuth } from '@/context/AuthContext';
import { identifySpecies, type IdentifyResult } from '@/lib/identify';
import type { DataQualityFlags, Sighting, SightingComment } from '@/lib/sightings';
import { addComment, deleteComment, deleteSighting, getQualityGrade, getSightingById, updateSighting } from '@/lib/sightings';

const KIND_COLOR: Record<string, string> = {
  plant: COLORS.lichen,
  bird: COLORS.lichen,
  insect: COLORS.lichen,
  snake: COLORS.slate,
  mammal: COLORS.granite,
  lizard: COLORS.slate,
  amphibian: COLORS.lichen,
  arachnid: COLORS.ink,
  fungus: COLORS.lichen,
  fish: COLORS.slate,
};

function AudioEvidenceCard({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  return (
    <Pressable
      onPress={() => (status.playing ? player.pause() : player.play())}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.granite },
        softShadow(0.04, 6, 2),
      ]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.lichen, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={status.playing ? 'pause' : 'play'} size={20} color={COLORS.bone} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 14 }}>Recording</Text>
        <Text style={{ color: COLORS.granite, fontSize: 12 }}>
          {status.playing ? 'Playing…' : 'Tap to play the bird call you recorded'}
        </Text>
      </View>
    </Pressable>
  );
}

type IdChoice = { speciesId: string; commonName: string; latin: string; kind: Species['kind'] };

// Local stand-in for "community identifications" (#34) — this app has no
// shared backend for other users to weigh in (see CLAUDE.md's offline-first
// architecture), so instead of crowd-sourced ID help, this re-runs the same
// on-device classifier against the sighting's own photo to surface
// alternates the user might have meant, plus a manual search fallback.
function AlternateIdSheet({
  sighting,
  onClose,
  onSelect,
}: {
  sighting: Sighting;
  onClose: () => void;
  onSelect: (choice: IdChoice) => void;
}) {
  const [candidates, setCandidates] = useState<IdentifyResult[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const uri = sighting.photoUris?.[0] ?? sighting.photoUri;
    if (!uri) return;
    setLoadingCandidates(true);
    identifySpecies(uri, { coords: sighting.location })
      .then((results) =>
        setCandidates(results.filter((r) => r.speciesId && r.speciesId !== sighting.speciesId)),
      )
      .finally(() => setLoadingCandidates(false));
  }, [sighting]);

  const q = searchQuery.trim().toLowerCase();
  const searchResults: Species[] = q
    ? CATALOG.filter(
        (sp) => sp.commonName.toLowerCase().includes(q) || sp.latin.toLowerCase().includes(q),
      ).slice(0, 10)
    : [];

  return (
    <Pressable
      style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
      onPress={onClose}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <Pressable
        onPress={() => {}}
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 40,
            maxHeight: '75%',
          },
          softShadow(0.2, 24, 8),
        ]}
      >
        <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
          Suggest a different ID
        </Text>
        <Text style={{ color: COLORS.granite, fontSize: 12, marginBottom: 14 }}>
          Re-checked on-device against this sighting&apos;s photo.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {loadingCandidates && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={COLORS.lichen} />
            </View>
          )}

          {!loadingCandidates && candidates.length === 0 && (
            <Text style={{ color: COLORS.granite, fontSize: 13, marginBottom: 14 }}>
              {sighting.photoUris?.[0] ?? sighting.photoUri
                ? 'No other on-device suggestions for this photo. Search below to pick a different species.'
                : 'This sighting has no photo to re-check. Search below to pick a different species.'}
            </Text>
          )}

          {candidates.map((c) => (
            <Pressable
              key={c.speciesId}
              onPress={() =>
                onSelect({ speciesId: c.speciesId!, commonName: c.commonName, latin: c.latin, kind: c.kind })
              }
              accessibilityLabel={`Use ${c.commonName}, ${c.confidence}% match`}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.granite,
                gap: 12,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.lichen, alignItems: 'center', justifyContent: 'center' }}>
                <SpeciesIcon kind={c.kind as never} size={20} color={COLORS.bone} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 14 }}>{c.commonName}</Text>
                <Text style={{ color: COLORS.granite, fontSize: 11, fontStyle: 'italic' }}>{c.latin}</Text>
              </View>
              <Text style={{ color: COLORS.lichen, fontWeight: '700', fontSize: 12 }}>{c.confidence}%</Text>
            </Pressable>
          ))}

          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: COLORS.granite,
                paddingHorizontal: 14,
                height: 44,
                gap: 8,
              }}
            >
              <Ionicons name="search" size={16} color={COLORS.granite} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Or search all species…"
                placeholderTextColor={COLORS.granite}
                autoCapitalize="none"
                autoCorrect={false}
                style={{ flex: 1, color: COLORS.ink, fontSize: 14 }}
                accessibilityLabel="Search species"
              />
            </View>
            {searchResults.map((sp) => (
              <Pressable
                key={sp.id}
                onPress={() => onSelect({ speciesId: sp.id, commonName: sp.commonName, latin: sp.latin, kind: sp.kind })}
                accessibilityLabel={`Select ${sp.commonName}`}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.granite,
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.bone, alignItems: 'center', justifyContent: 'center' }}>
                  <SpeciesIcon kind={sp.kind as never} size={20} color={COLORS.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.ink, fontWeight: '600', fontSize: 14 }}>{sp.commonName}</Text>
                  <Text style={{ color: COLORS.granite, fontSize: 11, fontStyle: 'italic' }}>{sp.latin}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SightingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [sighting, setSighting] = useState<Sighting | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [flags, setFlags] = useState<DataQualityFlags>({});
  const [comments, setComments] = useState<SightingComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [reviewingId, setReviewingId] = useState(false);

  async function applyIdChoice(choice: IdChoice) {
    if (!user || !sighting) return;
    setSighting((prev) =>
      prev ? { ...prev, speciesId: choice.speciesId, commonName: choice.commonName, latinName: choice.latin, kind: choice.kind } : prev,
    );
    await updateSighting(user.uid, sighting.id, {
      speciesId: choice.speciesId,
      commonName: choice.commonName,
      latinName: choice.latin,
      kind: choice.kind,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReviewingId(false);
  }

  useEffect(() => {
    if (!user || !id) return;
    getSightingById(user.uid, id).then((s) => {
      if (s) {
        setSighting(s);
        setNotes(s.notes ?? '');
        setFlags(s.dataQualityFlags ?? {});
        setComments(s.comments ?? []);
      }
    });
  }, [user, id]);

  async function toggleFlag(key: keyof DataQualityFlags) {
    if (!user || !sighting) return;
    const current = flags[key];
    const next: DataQualityFlags = { ...flags, [key]: current === undefined ? true : current === true ? false : undefined };
    setFlags(next);
    setSighting((prev) => prev ? { ...prev, dataQualityFlags: next } : prev);
    await updateSighting(user.uid, sighting.id, { dataQualityFlags: next });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function saveNotes() {
    if (!user || !sighting) return;
    await updateSighting(user.uid, sighting.id, { notes: notes.trim() || undefined });
    setSighting((prev) => prev ? { ...prev, notes: notes.trim() || undefined } : prev);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingNotes(false);
  }

  async function handleAddComment() {
    if (!user || !sighting || !commentDraft.trim() || postingComment) return;
    setPostingComment(true);
    const comment = await addComment(user.uid, sighting.id, commentDraft);
    setComments((prev) => [...prev, comment]);
    setCommentDraft('');
    setPostingComment(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleDeleteComment(commentId: string) {
    if (!user || !sighting) return;
    await deleteComment(user.uid, sighting.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function handleDelete() {
    Alert.alert('Delete this sighting?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user || !sighting) return;
          await deleteSighting(user.uid, sighting.id);
          router.back();
        },
      },
    ]);
  }

  if (!sighting) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.granite, fontSize: 14 }}>Loading…</Text>
      </View>
    );
  }

  const species = getSpeciesById(sighting.speciesId);
  const kindColor = KIND_COLOR[sighting.kind] ?? COLORS.lichen;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: top + 12,
          paddingBottom: 12,
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
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: COLORS.granite,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: COLORS.ink, fontWeight: '700', fontSize: 18 }} numberOfLines={1}>
          {sighting.commonName}
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          accessibilityLabel="Delete sighting"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.lichen} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Photo carousel / species icon */}
        <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: 20 }}>
          {(() => {
            const photos = sighting.photoUris?.length ? sighting.photoUris : sighting.photoUri ? [sighting.photoUri] : [];
            if (photos.length === 0) {
              return (
                <View style={{ width: '100%', height: 180, borderRadius: 20, backgroundColor: kindColor, alignItems: 'center', justifyContent: 'center' }}>
                  <SpeciesIcon kind={sighting.kind as never} size={80} color={COLORS.bone} />
                </View>
              );
            }
            if (photos.length === 1) {
              return (
                <Image source={{ uri: photos[0] }} style={{ width: '100%', height: 240, borderRadius: 20 }} contentFit="cover" />
              );
            }
            return (
              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {photos.map((uri, i) => (
                    <Image key={`${uri}-${i}`} source={{ uri }} style={{ width: 260, height: 240, borderRadius: 20 }} contentFit="cover" />
                  ))}
                </ScrollView>
                <Text style={{ color: COLORS.granite, fontSize: 11, textAlign: 'center', marginTop: 6 }}>{photos.length} photos · swipe to browse</Text>
              </View>
            );
          })()}
        </Animated.View>

        {sighting.audioUri && <AudioEvidenceCard uri={sighting.audioUri} />}

        {/* Identity */}
        <Animated.View entering={FadeInDown.delay(80).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.granite },
          softShadow(0.04, 6, 2),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: kindColor, alignItems: 'center', justifyContent: 'center' }}>
              <SpeciesIcon kind={sighting.kind as never} size={32} color={COLORS.bone} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.ink, fontWeight: '800', fontSize: 20 }}>{sighting.commonName}</Text>
              <Text style={{ color: COLORS.granite, fontStyle: 'italic', fontSize: 14, marginTop: 2 }}>{sighting.latinName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setReviewingId(true)}
              accessibilityLabel="Suggest a different ID for this sighting"
              accessibilityRole="button"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.background,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: COLORS.granite,
              }}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.granite} />
            </TouchableOpacity>
          </View>
          {species && (
            <Text style={{ color: COLORS.granite, fontSize: 12, marginTop: 12, lineHeight: 18 }} numberOfLines={3}>
              {species.description}
            </Text>
          )}
        </Animated.View>

        {/* Date, Location & Privacy */}
        <Animated.View entering={FadeInDown.delay(140).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.granite, gap: 12 },
          softShadow(0.03, 4, 1),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.lichen} />
            <Text style={{ color: COLORS.ink, fontSize: 14, flex: 1 }}>{formatFullDate(sighting.capturedAt)}</Text>
          </View>
          {sighting.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="location-outline" size={18} color={COLORS.lichen} />
              <Text style={{ color: COLORS.ink, fontSize: 14 }}>
                {sighting.location.lat.toFixed(4)}°, {sighting.location.lng.toFixed(4)}°
              </Text>
            </View>
          )}
          <Pressable
            onPress={async () => {
              if (!user || !sighting) return;
              const next = !sighting.isPrivate;
              setSighting((prev) => prev ? { ...prev, isPrivate: next } : prev);
              await updateSighting(user.uid, sighting.id, { isPrivate: next });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            accessibilityLabel={sighting.isPrivate ? 'Make observation public' : 'Make observation private'}
            accessibilityRole="switch"
            accessibilityState={{ checked: !!sighting.isPrivate }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
          >
            <Ionicons name={sighting.isPrivate ? 'lock-closed' : 'lock-open-outline'} size={18} color={sighting.isPrivate ? COLORS.slate : COLORS.granite} />
            <Text style={{ color: sighting.isPrivate ? COLORS.slate : COLORS.granite, fontSize: 14, flex: 1, fontWeight: sighting.isPrivate ? '600' : '400' }}>
              {sighting.isPrivate ? 'Private — excluded from exports' : 'Public (tap to make private)'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.delay(200).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: COLORS.granite },
          softShadow(0.03, 4, 1),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ flex: 1, color: COLORS.granite, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Field notes
            </Text>
            <TouchableOpacity
              onPress={() => setEditingNotes((v) => !v)}
              accessibilityLabel={editingNotes ? 'Cancel editing notes' : 'Edit notes'}
              accessibilityRole="button"
            >
              <Text style={{ color: COLORS.lichen, fontWeight: '600', fontSize: 13 }}>
                {editingNotes ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          {editingNotes ? (
            <>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="What did you notice? Behavior, habitat, conditions…"
                placeholderTextColor={COLORS.granite}
                multiline
                maxLength={500}
                autoFocus
                style={{
                  color: COLORS.ink, fontSize: 14, lineHeight: 21,
                  minHeight: 80, borderWidth: 1, borderColor: COLORS.granite,
                  borderRadius: 10, padding: 10,
                }}
              />
              <Pressable
                onPress={saveNotes}
                accessibilityLabel="Save notes"
                accessibilityRole="button"
                style={[
                  { backgroundColor: COLORS.lichen, borderRadius: 20, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
                  glow(COLORS.lichen, 6),
                ]}
              >
                <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 14 }}>Save notes</Text>
              </Pressable>
            </>
          ) : (
            <Text style={{ color: sighting.notes ? COLORS.ink : COLORS.granite, fontSize: 14, lineHeight: 21, fontStyle: sighting.notes ? 'normal' : 'italic' }}>
              {sighting.notes ?? 'No notes yet — tap Edit to add some.'}
            </Text>
          )}
        </Animated.View>

        {/* Comments */}
        <Animated.View entering={FadeInDown.delay(230).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.granite },
          softShadow(0.03, 4, 1),
        ]}>
          <Text style={{ color: COLORS.granite, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Comments
          </Text>

          {comments.length === 0 && (
            <Text style={{ color: COLORS.granite, fontSize: 14, fontStyle: 'italic', marginBottom: 14 }}>
              No comments yet.
            </Text>
          )}

          {comments.map((c) => (
            <View
              key={c.id}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.granite,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.granite, fontSize: 11, marginBottom: 3 }}>
                  {new Date(c.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </Text>
                <Text style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20 }}>{c.text}</Text>
              </View>
              <Pressable
                onPress={() => handleDeleteComment(c.id)}
                accessibilityLabel="Delete comment"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle-outline" size={18} color={COLORS.granite} />
              </Pressable>
            </View>
          ))}

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 14 }}>
            <TextInput
              value={commentDraft}
              onChangeText={setCommentDraft}
              placeholder="Add a comment…"
              placeholderTextColor={COLORS.granite}
              multiline
              maxLength={300}
              style={{
                flex: 1,
                color: COLORS.ink,
                fontSize: 14,
                lineHeight: 20,
                borderWidth: 1,
                borderColor: COLORS.granite,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                minHeight: 40,
              }}
              accessibilityLabel="Comment text"
            />
            <Pressable
              onPress={handleAddComment}
              disabled={!commentDraft.trim() || postingComment}
              accessibilityLabel="Post comment"
              accessibilityRole="button"
              style={{
                backgroundColor: commentDraft.trim() ? COLORS.lichen : COLORS.granite,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 13 }}>Post</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Data quality flags */}
        <Animated.View entering={FadeInDown.delay(260).duration(280)} style={[
          { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.granite },
          softShadow(0.03, 4, 1),
        ]}>
          {(() => {
            const grade = getQualityGrade(sighting);
            const cfg = {
              research: { label: 'Research Grade', color: COLORS.lichen },
              needs_id: { label: 'Needs ID',       color: COLORS.lichen },
              casual:   { label: 'Casual',          color: COLORS.granite },
            }[grade];
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ color: COLORS.granite, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Data quality review
                </Text>
                <View style={{ backgroundColor: cfg.color + '25', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: cfg.color + '55' }}>
                  <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label}</Text>
                </View>
              </View>
            );
          })()}
          {(
            [
              ['evidencePresent',  'Evidence of organism present'],
              ['dateAccurate',     'Date is accurate'],
              ['locationAccurate', 'Location is correct'],
              ['wildOrganism',     'Wild (not captive / cultivated)'],
            ] as [keyof DataQualityFlags, string][]
          ).map(([key, label]) => {
            const val = flags[key];
            return (
              <Pressable
                key={key}
                onPress={() => toggleFlag(key)}
                accessibilityLabel={`${label}: ${val === true ? 'passes' : val === false ? 'flagged' : 'unreviewed'}. Tap to cycle.`}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.granite }}
              >
                <Text style={{ color: COLORS.ink, fontSize: 14, flex: 1 }}>{label}</Text>
                <View style={{
                  width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: val === true ? COLORS.lichen : val === false ? COLORS.lichen : COLORS.bone,
                  borderWidth: 1.5, borderColor: val === undefined ? COLORS.granite : 'transparent',
                }}>
                  <Ionicons
                    name={val === true ? 'checkmark' : val === false ? 'close' : 'help'}
                    size={15}
                    color={val === undefined ? COLORS.granite : COLORS.bone}
                  />
                </View>
              </Pressable>
            );
          })}
          <Text style={{ color: COLORS.granite, fontSize: 11, marginTop: 10, fontStyle: 'italic' }}>
            Tap to cycle: unreviewed → passes → flagged
          </Text>
        </Animated.View>

        {/* View species button */}
        {species && (
          <Animated.View entering={FadeInDown.delay(260).duration(280)}>
            <TouchableOpacity
              onPress={() => router.push(`/species/${sighting.speciesId}` as never)}
              accessibilityLabel={`View ${sighting.commonName} in field guide`}
              accessibilityRole="button"
              style={[
                {
                  backgroundColor: COLORS.lichen, borderRadius: 24,
                  paddingVertical: 16, alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center', gap: 8,
                },
                glow(COLORS.lichen, 8),
              ]}
            >
              <Ionicons name="book-outline" size={18} color={COLORS.bone} />
              <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 16 }}>View in field guide</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Ask about this photo (photo-grounded on-device Q&A, #24) */}
        {(sighting.photoUris?.[0] ?? sighting.photoUri) && (
          <Animated.View entering={FadeInDown.delay(280).duration(280)} style={{ marginTop: 10 }}>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/ask?speciesId=${sighting.speciesId}&photoUri=${encodeURIComponent(sighting.photoUris?.[0] ?? sighting.photoUri ?? '')}` as never,
                )
              }
              accessibilityLabel="Ask about this photo"
              accessibilityRole="button"
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 24,
                paddingVertical: 15,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: COLORS.granite,
              }}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.granite} />
              <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15 }}>Ask about this photo</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {reviewingId && (
        <AlternateIdSheet
          sighting={sighting}
          onClose={() => setReviewingId(false)}
          onSelect={applyIdChoice}
        />
      )}
    </View>
  );
}
