import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, glow, softShadow } from '@/constants/AppTheme';
import { getSpeciesById } from '@/constants/catalog';
import {
  type ChatMessage,
  type LlmState,
  chat,
  downloadModel,
  getLlmState,
  loadModel,
} from '@/lib/llm';

const SUGGESTED: string[] = [
  'How do I identify it in the field?',
  'Is it dangerous?',
  'What does it eat?',
  'When is the best time to spot one?',
];

export default function AskScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { speciesId } = useLocalSearchParams<{ speciesId?: string }>();

  const species = speciesId ? getSpeciesById(speciesId) : undefined;

  const [llmState, setLlmState] = useState<LlmState>('not_downloaded');
  const [downloadPct, setDownloadPct] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getLlmState().then((state) => {
      if (state === 'ready') {
        setLlmState('loading');
        loadModel((p) => setLoadPct(p ?? 0))
          .then(() => setLlmState('ready'))
          .catch(() => setLlmState('error'));
      } else {
        setLlmState(state as LlmState);
      }
    });
  }, []);

  async function handleDownload() {
    setLlmState('downloading');
    try {
      await downloadModel((pct) => setDownloadPct(pct));
      setLlmState('loading');
      await loadModel((p) => setLoadPct(p ?? 0));
      setLlmState('ready');
    } catch {
      Alert.alert('Download failed', 'Check your connection and try again.');
      setLlmState('not_downloaded');
    }
  }

  async function send(text = input.trim()) {
    if (!text || streaming) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setStreaming(true);

    let reply = '';
    setMessages([...updated, { role: 'assistant', content: '…' }]);

    try {
      await chat(updated, speciesId, (token) => {
        reply += token;
        setMessages([...updated, { role: 'assistant', content: reply }]);
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setStreaming(false);
    }
  }

  if (llmState === 'not_downloaded') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ position: 'absolute', top: top + 14, left: 16, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.sand }}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: top }}>
          <Animated.View entering={FadeIn.delay(100).duration(400)} style={{ alignItems: 'center' }}>
            <View style={[{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.clay, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, glow(COLORS.clay, 12)]}>
              <Ionicons name="chatbubble-ellipses-outline" size={38} color={COLORS.cream} />
            </View>
            <Text style={{ color: COLORS.ink, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>
              Ask the Field Guide
            </Text>
            <Text style={{ color: COLORS.bark, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 32 }}>
              An on-device AI trained on desert ecology answers your species questions — no internet needed once downloaded.
            </Text>
            <View style={{ backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, width: '100%', borderWidth: 1, borderColor: COLORS.sand, marginBottom: 32 }}>
              <Text style={{ color: COLORS.bark, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Model details</Text>
              <Text style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20 }}>
                Llama 3.2 3B Instruct (Q4_K_M){'\n'}
                <Text style={{ color: COLORS.bark }}>~2 GB · downloaded once to your device</Text>
              </Text>
            </View>
            <Pressable
              onPress={handleDownload}
              style={[{ width: '100%', backgroundColor: COLORS.clay, borderRadius: 24, paddingVertical: 16, alignItems: 'center' }, glow(COLORS.clay, 10)]}
            >
              <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 16 }}>Download Model (~2 GB)</Text>
            </Pressable>
            <Text style={{ color: COLORS.bark, fontSize: 12, marginTop: 10, textAlign: 'center' }}>
              Requires Wi-Fi. Only needed once.
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  if (llmState === 'downloading' || llmState === 'loading') {
    const pct = llmState === 'downloading' ? downloadPct : loadPct;
    const label = llmState === 'downloading' ? `Downloading… ${pct}%` : `Loading model… ${pct}%`;
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <ActivityIndicator size="large" color={COLORS.clay} />
        <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 17, marginTop: 24 }}>{label}</Text>
        {llmState === 'downloading' && (
          <View style={{ width: '100%', height: 6, backgroundColor: COLORS.sand, borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${pct}%`, backgroundColor: COLORS.clay, borderRadius: 3 }} />
          </View>
        )}
        <Text style={{ color: COLORS.bark, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
          {llmState === 'downloading' ? 'Keep the app open…' : 'One moment…'}
        </Text>
      </View>
    );
  }

  if (llmState === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="alert-circle-outline" size={52} color={COLORS.clay} />
        <Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '700', marginTop: 20 }}>Failed to load model</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 24, backgroundColor: COLORS.clay, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 32 }}>
          <Text style={{ color: COLORS.cream, fontWeight: '700', fontSize: 15 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Ready — show chat UI
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[{ paddingTop: top + 14, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: COLORS.background, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.sand }, softShadow(0.04, 4, 1)]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.sand }}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.ink, fontWeight: '700', fontSize: 16 }}>
            {species ? `Ask about ${species.commonName}` : 'Field Guide AI'}
          </Text>
          <Text style={{ color: COLORS.bark, fontSize: 11, marginTop: 1 }}>On-device · No internet needed</Text>
        </View>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.sage }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Species context chip */}
        {species && (
          <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center', marginBottom: 4 }}>
            <View style={{ backgroundColor: COLORS.sage, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ color: COLORS.ink, fontSize: 12, fontWeight: '700' }}>
                {species.commonName} · {species.latin}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Welcome message */}
        {messages.length === 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={[{ backgroundColor: COLORS.surface, borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, maxWidth: '82%', borderWidth: 1, borderColor: COLORS.sand }, softShadow(0.04, 6, 2)]}>
              <Text style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20 }}>
                {species
                  ? `I know all about ${species.commonName}. What would you like to know?`
                  : 'I\'m your on-device desert nature guide. Ask me anything about the species in the Sonoran, Mojave, Chihuahuan, or Great Basin deserts.'}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Suggested questions */}
        {messages.length === 0 && (
          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SUGGESTED.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => send(q)}
                  style={{ backgroundColor: COLORS.cream, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.sand }}
                >
                  <Text style={{ color: COLORS.clay, fontSize: 13, fontWeight: '600' }}>{q}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.delay(60).springify().damping(16)}
            style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <View
              style={[
                {
                  maxWidth: '82%',
                  borderRadius: 18,
                  padding: 12,
                  backgroundColor: msg.role === 'user' ? COLORS.clay : COLORS.surface,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 18,
                  borderWidth: msg.role === 'assistant' ? 1 : 0,
                  borderColor: COLORS.sand,
                },
                msg.role === 'user' ? {} : softShadow(0.04, 6, 2),
              ]}
            >
              <Text style={{ color: msg.role === 'user' ? COLORS.cream : COLORS.ink, fontSize: 14, lineHeight: 21 }}>
                {msg.content}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={[{ paddingHorizontal: 12, paddingVertical: 10, paddingBottom: bottom + 10, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.sand, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }]}>
        <View style={[{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.sand, paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question…"
            placeholderTextColor={COLORS.bark}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send()}
            style={{ color: COLORS.ink, fontSize: 14, lineHeight: 20, maxHeight: 100 }}
            accessibilityLabel="Ask a question"
          />
        </View>
        <Pressable
          onPress={() => send()}
          disabled={!input.trim() || streaming}
          accessibilityLabel="Send message"
          accessibilityRole="button"
          style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: input.trim() && !streaming ? COLORS.clay : COLORS.sand, alignItems: 'center', justifyContent: 'center' }, input.trim() && !streaming ? glow(COLORS.clay, 8) : {}]}
        >
          {streaming
            ? <ActivityIndicator size="small" color={COLORS.cream} />
            : <Ionicons name="arrow-up" size={20} color={COLORS.cream} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
