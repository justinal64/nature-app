import React from 'react';
import { Pressable, Text } from 'react-native';

import { COLORS, glow } from '@/constants/AppTheme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
};

export default function Button({ label, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  const bgColor =
    variant === 'primary' ? COLORS.primary : variant === 'secondary' ? COLORS.secondary : 'transparent';
  const textColor = variant === 'outline' ? COLORS.secondary : '#FFFFFF';
  const borderColor = variant === 'outline' ? COLORS.secondary : 'transparent';

  return (
    <Pressable
      className={`p-[18px] rounded-[30px] items-center mt-6 border ${disabled ? 'opacity-60' : ''}`}
      style={[
        { backgroundColor: bgColor, borderColor },
        variant !== 'outline' ? glow(`${bgColor}80`, 10) : {},
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-lg font-bold tracking-widest" style={{ color: textColor }}>
        {label}
      </Text>
    </Pressable>
  );
}
