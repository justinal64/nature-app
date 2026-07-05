import { Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: 'sentences' | 'none' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize = 'sentences',
  keyboardType,
  testID,
}: Props) {
  const hasError = !!error;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: COLORS.granite,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.6,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: hasError ? COLORS.lichen : COLORS.granite,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontSize: 15,
          color: COLORS.ink,
        }}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={COLORS.granite}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        testID={testID}
      />
      {hasError ? (
        <Text style={{ color: COLORS.lichen, fontSize: 12, marginTop: 6, fontWeight: '500' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
