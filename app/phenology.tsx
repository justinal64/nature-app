import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, softShadow } from '@/constants/AppTheme';
import {
  CATEGORY_ORDER,
  MONTH_NAMES,
  MONTH_NAMES_FULL,
  type PhenologyCategory,
  type PhenologyEvent,
  type PhenologyEventType,
  getCurrentMonth,
  getPhenologyForMonth,
} from '@/constants/phenology';

// ─── Event type config ────────────────────────────────────────────────────────

type EventConfig = { icon: string; color: string; label: string };

const EVENT_TYPE_CONFIG: Record<PhenologyEventType, EventConfig> = {
  bloom:     { icon: 'flower-outline',        color: COLORS.sage,    label: 'Blooming'   },
  fruiting:  { icon: 'nutrition-outline',     color: '#7BAF5C',      label: 'Fruiting'   },
  arrival:   { icon: 'arrow-up-circle-outline', color: COLORS.dusk,  label: 'Arriving'   },
  departure: { icon: 'arrow-down-circle-outline', color: '#9B7EB8',  label: 'Departing'  },
  nesting:   { icon: 'home-outline',          color: COLORS.bark,    label: 'Nesting'    },
  active:    { icon: 'flash-outline',         color: COLORS.clay,    label: 'Active'     },
  dormant:   { icon: 'moon-outline',          color: '#8E9AAF',      label: 'Dormant'    },
  mating:    { icon: 'heart-outline',         color: COLORS.gold,    label: 'Mating'     },
  birthing:  { icon: 'happy-outline',         color: '#E8A95A',      label: 'Birthing'   },
  emergence: { icon: 'sunny-outline',         color: COLORS.gold,    label: 'Emerging'   },
  special:   { icon: 'star-outline',          color: COLORS.clay,    label: 'Special'    },
};

const CATEGORY_ICONS: Record<PhenologyCategory, string> = {
  'Plants':              'leaf-outline',
  'Birds':               'logo-octocat',
  'Reptiles':            'ellipse-outline',
  'Insects & Arachnids': 'bug-outline',
  'Mammals':             'paw-outline',
  'Special Events':      'sparkles-outline',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhenologyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState(today);
  const monthScrollRef = useRef<ScrollView>(null);
  const eventScrollRef = useRef<ScrollView>(null);

  const events = getPhenologyForMonth(selectedMonth);

  const grouped = CATEGORY_ORDER.reduce<Record<PhenologyCategory, PhenologyEvent[]>>(
    (acc, cat) => {
      const items = events.filter((e) => e.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<PhenologyCategory, PhenologyEvent[]>,
  );

  // Scroll month strip to today's month on first render only
  useEffect(() => {
    setTimeout(() => {
      monthScrollRef.current?.scrollTo({ x: Math.max(0, today - 2) * 60, animated: false });
    }, 100);
  // today is stable (computed once from Date), intentionally not re-running on month change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthSelect = (m: number) => {
    setSelectedMonth(m);
    eventScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.ink,
          paddingTop: insets.top + 8,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
          </Pressable>
          <Text
            style={{
              color: COLORS.cream,
              fontSize: 18,
              fontWeight: '700',
              marginLeft: 14,
              flex: 1,
            }}
          >
            Phenology Calendar
          </Text>
        </View>

        <Text style={{ color: COLORS.sand, fontSize: 13, lineHeight: 18 }}>
          What&apos;s happening in the desert Southwest — blooms, migrations, and seasonal events.
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
          <View
            style={{
              backgroundColor: COLORS.clay,
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: COLORS.cream, fontSize: 12, fontWeight: '700' }}>
              {MONTH_NAMES_FULL[selectedMonth]}
            </Text>
          </View>
          <Text style={{ color: COLORS.bark, fontSize: 12 }}>
            {events.length} event{events.length !== 1 ? 's' : ''} active
          </Text>
          {selectedMonth === today && (
            <Text style={{ color: COLORS.sage, fontSize: 12, fontWeight: '600' }}>· Now</Text>
          )}
        </View>
      </View>

      {/* Month strip */}
      <View style={{ backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <ScrollView
          ref={monthScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 4 }}
        >
          {MONTH_NAMES.map((name, i) => {
            const isSelected = i === selectedMonth;
            const isToday = i === today;
            const count = getPhenologyForMonth(i).length;
            return (
              <Pressable
                key={name}
                onPress={() => handleMonthSelect(i)}
                style={{
                  width: 52,
                  alignItems: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 4,
                  borderRadius: 10,
                  backgroundColor: isSelected ? COLORS.ink : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? COLORS.cream : isToday ? COLORS.clay : COLORS.bark,
                  }}
                >
                  {name}
                </Text>
                {/* Activity dot */}
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    marginTop: 3,
                    backgroundColor:
                      count > 15 ? COLORS.clay
                      : count > 8 ? COLORS.gold
                      : count > 0 ? COLORS.sage
                      : 'transparent',
                  }}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Event list */}
      <ScrollView
        ref={eventScrollRef}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat, catIndex) => (
          <Animated.View
            key={cat}
            entering={FadeInDown.delay(catIndex * 40).springify().damping(18)}
          >
            {/* Category header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 10,
                gap: 8,
              }}
            >
              <Ionicons
                name={CATEGORY_ICONS[cat] as never}
                size={16}
                color={COLORS.bark}
              />
              <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '700' }}>{cat}</Text>
              <View
                style={{
                  backgroundColor: COLORS.sand,
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                }}
              >
                <Text style={{ color: COLORS.bark, fontSize: 11, fontWeight: '600' }}>
                  {grouped[cat].length}
                </Text>
              </View>
            </View>

            {/* Events in category */}
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {grouped[cat].map((event) => <EventCard key={event.id} event={event} />)}
            </View>
          </Animated.View>
        ))}

        {events.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
            <Ionicons name="moon-outline" size={40} color={COLORS.sand} />
            <Text
              style={{
                color: COLORS.bark,
                fontSize: 15,
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 22,
              }}
            >
              No major phenological events recorded for this month in our database.
            </Text>
          </View>
        )}

        {/* Data attribution */}
        <View
          style={{
            marginTop: 24,
            marginHorizontal: 20,
            padding: 14,
            backgroundColor: COLORS.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text style={{ color: COLORS.bark, fontSize: 11, lineHeight: 16 }}>
            Event timing is approximate and varies with elevation, microclimate, and year-to-year rainfall.
            Data informed by USANPN, Arizona-Sonora Desert Museum, and Sonoran Desert Network monitoring.
            Week ranges are median observations — extreme years shift timing by 2–4 weeks.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: PhenologyEvent }) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_TYPE_CONFIG[event.eventType];

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel={`${event.commonName} — ${config.label}`}
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...softShadow(),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
        {/* Type icon badge */}
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: config.color + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={config.icon as never} size={17} color={config.color} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '600' }}>
            {event.commonName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                backgroundColor: config.color + '33',
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 1,
              }}
            >
              <Text style={{ color: config.color, fontSize: 10, fontWeight: '700' }}>
                {config.label.toUpperCase()}
              </Text>
            </View>
            {event.peakWeek && (
              <Text style={{ color: COLORS.bark, fontSize: 10 }}>
                peaks wk {event.peakWeek}
              </Text>
            )}
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.bark}
        />
      </View>

      {expanded && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingBottom: 12,
            paddingTop: 0,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}
        >
          <Text style={{ color: COLORS.bark, fontSize: 13, lineHeight: 19, marginTop: 10 }}>
            {event.note}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
