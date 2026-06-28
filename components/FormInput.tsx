import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';

type FormInputProps = TextInputProps & {
  label: string;
};

export default function FormInput({ label, ...inputProps }: FormInputProps) {
  return (
    <View className="mb-6">
      <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">{label}</Text>
      <TextInput
        className="border border-border bg-card rounded-xl p-4 text-base text-text"
        placeholderTextColor={COLORS.textDim}
        accessibilityLabel={label}
        {...inputProps}
      />
    </View>
  );
}
