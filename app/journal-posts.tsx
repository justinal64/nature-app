import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useJournalPosts } from '@/hooks/useJournalPosts';
import { addJournalPost, deleteJournalPost } from '@/lib/journal-posts';
import { formatRelativeDate } from '@/utils/date';

export default function JournalPostsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { posts, refresh } = useJournalPosts(user?.uid);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!user || !title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await addJournalPost({
        userId: user.uid,
        title: title.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setBody('');
      setComposing(false);
      await refresh();
    } catch {
      Alert.alert('Error', 'Could not save your post.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete post', 'This can\'t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          await deleteJournalPost(user.uid, id);
          await refresh();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: top + 14, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.granite }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 18 }}>Journal Posts</Text>
          <Text style={{ color: COLORS.granite, fontSize: 12 }}>Trip reports and reflections — not tied to a species</Text>
        </View>
        <TouchableOpacity
          onPress={() => setComposing((v) => !v)}
          accessibilityLabel={composing ? 'Cancel new post' : 'Write a post'}
          accessibilityRole="button"
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lichen, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={composing ? 'close' : 'add'} size={22} color={COLORS.bone} />
        </TouchableOpacity>
      </View>

      {composing && (
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.granite, gap: 10 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={COLORS.granite}
            style={{ color: COLORS.ink, fontSize: 16, fontWeight: '700' }}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="What happened out there?"
            placeholderTextColor={COLORS.granite}
            multiline
            style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20, minHeight: 100, textAlignVertical: 'top' }}
          />
          <Pressable
            onPress={save}
            disabled={!title.trim() || !body.trim() || saving}
            style={{
              alignSelf: 'flex-end',
              backgroundColor: title.trim() && body.trim() ? COLORS.lichen : COLORS.granite,
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ color: COLORS.bone, fontWeight: '700', fontSize: 14 }}>
              {saving ? 'Saving…' : 'Post'}
            </Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom + 24, gap: 12 }}>
        {posts.length === 0 && !composing ? (
          <View style={{ alignItems: 'center', marginTop: 60, gap: 8 }}>
            <Ionicons name="book-outline" size={40} color={COLORS.granite} />
            <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>No posts yet</Text>
            <Text style={{ color: COLORS.granite, fontSize: 13, textAlign: 'center' }}>
              Write about a trip, a hike, or anything worth remembering.
            </Text>
          </View>
        ) : (
          posts.map((post, i) => (
            <Animated.View key={post.id} entering={FadeInDown.delay(i * 40).duration(250)}>
              <Pressable
                onLongPress={() => confirmDelete(post.id)}
                style={[
                  { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.granite },
                  softShadow(0.04, 6, 2),
                ]}
              >
                <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>{post.title}</Text>
                <Text style={{ color: COLORS.granite, fontSize: 11, marginBottom: 8 }}>{formatRelativeDate(post.createdAt)}</Text>
                <Text style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20 }}>{post.body}</Text>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
