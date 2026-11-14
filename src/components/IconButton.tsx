import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';

import { radius, TOUCH_TARGET } from '../theme';
import { Touchable, type TouchableProps } from './Touchable';

export interface IconButtonProps extends Omit<TouchableProps, 'children'> {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Accessible name; required because the button has no visible text. */
  label: string;
  color: string;
  size?: number;
}

export function IconButton({ icon, label, color, size = 20, style, ...rest }: IconButtonProps) {
  return (
    <Touchable
      role="button"
      aria-label={label}
      hitSlop={4}
      {...rest}
      style={(state) => [styles.base, typeof style === 'function' ? style(state) : style]}
    >
      <Ionicons name={icon} size={size} color={color} aria-hidden />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
