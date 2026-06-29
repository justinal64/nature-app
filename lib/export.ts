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
  const headers = [
    'taxon_name',
    'observed_on',
    'time_observed_at',
    'observation_type',
    'sex',
    'life_stage',
    'activity',
    'phenology',
    'description',
    'latitude',
    'longitude',
    'captive_cultivated',
    'tag_list',
  ];

  const rows = sightings.map((s) => [
    escapeCsv(s.latinName),
    escapeCsv(formatDate(s.capturedAt)),
    escapeCsv(s.capturedAt),
    escapeCsv(s.observationType ?? 'organism'),
    escapeCsv(s.sex),
    escapeCsv(s.lifeStage),
    escapeCsv(s.activity),
    escapeCsv(s.phenology),
    escapeCsv(s.notes),
    s.location ? String(s.location.lat) : '',
    s.location ? String(s.location.lng) : '',
    'false',
    escapeCsv(s.kind === 'cactus' ? 'plant' : s.kind),
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
