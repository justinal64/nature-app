import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { Sighting } from '@/lib/sightings';

// Exports sightings in iNaturalist-compatible Darwin Core CSV format.
// See: https://www.inaturalist.org/pages/import
function escapeCsv(val: string | undefined): string {
  if (!val) return '';
  const s = val.replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function formatDate(iso: string): string {
  return iso.split('T')[0]; // YYYY-MM-DD
}

export async function exportSightingsCsv(sightings: Sighting[]): Promise<void> {
  sightings = sightings.filter((s) => !s.isPrivate);
  const headers = [
    'taxon_name',
    'observed_on',
    'time_observed_at',
    'description',
    'latitude',
    'longitude',
    'geoprivacy',
    'captive_cultivated',
    'tag_list',
  ];

  // observation_type/sex/life_stage/activity/phenology aren't recognized
  // iNaturalist import columns (only taxon_name, observed_on, description,
  // latitude, longitude, geoprivacy, and tag_list are) — fold them into
  // tags instead of dropping them.
  function annotationTags(s: Sighting): string {
    const tags: (string | undefined)[] = [
      s.observationType && s.observationType !== 'organism' ? s.observationType : undefined,
      s.sex,
      s.lifeStage,
      s.activity,
      s.phenology,
    ];
    return tags.filter((v): v is string => !!v).join(',');
  }

  const rows = sightings.map((s) => [
    escapeCsv(s.latinName),
    escapeCsv(formatDate(s.capturedAt)),
    escapeCsv(s.capturedAt),
    escapeCsv(s.notes),
    s.location ? String(s.location.lat) : '',
    s.location ? String(s.location.lng) : '',
    s.locationObscured ? 'obscured' : '',
    s.dataQualityFlags?.wildOrganism === false ? 'true' : 'false',
    escapeCsv([annotationTags(s), s.kind === 'plant' ? 'plant' : s.kind === 'lizard' ? 'reptile' : s.kind === 'amphibian' ? 'amphibian' : s.kind === 'arachnid' ? 'arachnida' : s.kind === 'fungus' ? 'fungi' : s.kind === 'fish' ? 'actinopterygii' : s.kind].filter(Boolean).join(',')),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const filename = `wildlens-sightings-${formatDate(new Date().toISOString())}.csv`;
  const path = `${FileSystem.cacheDirectory ?? ''}${filename}`;

  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing not available on this device.');

  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Export sightings',
    UTI: 'public.comma-separated-values-text',
  });
}
