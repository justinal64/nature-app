import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  testID?: string;
};

export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = 'Password',
  error,
  testID,
}: Props) {
  const [show, setShow] = useState(false);
  const hasError = !!error;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: COLORS.bark,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.6,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={{
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: hasError ? COLORS.clay : COLORS.sand,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            paddingRight: 46,
            fontSize: 15,
            color: COLORS.ink,
          }}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={COLORS.bark}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          testID={testID}
        />
        <Pressable
          onPress={() => setShow((v) => !v)}
          accessibilityLabel={show ? 'Hide password' : 'Show password'}
          hitSlop={10}
          style={{
            position: 'absolute',
            right: 12,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.bark} />
        </Pressable>
      </View>
      {hasError ? (
        <Text style={{ color: COLORS.clay, fontSize: 12, marginTop: 6, fontWeight: '500' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
