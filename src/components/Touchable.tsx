import { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';

// Emulates CSS :focus-visible — only show the focus ring when the user is
// navigating with the keyboard, not after a mouse click or tap.
let keyboardModality = false;
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.addEventListener('keydown', () => (keyboardModality = true), true);
  document.addEventListener('pointerdown', () => (keyboardModality = false), true);
}

export interface TouchableState {
  pressed: boolean;
  focused: boolean;
}

export interface TouchableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle> | ((state: TouchableState) => StyleProp<ViewStyle>);
}

/**
 * A Pressable that shows a visible keyboard-focus ring on web and dims
 * slightly while pressed. Use for every interactive element.
 */
export const Touchable = forwardRef<View, TouchableProps>(function Touchable(
  { style, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      ref={ref}
      onFocus={(e) => {
        setFocused(keyboardModality);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed, focused }) : style,
        pressed && { opacity: 0.8 },
        rest.disabled && { opacity: 0.5 },
        focused && {
          outlineColor: colors.focus,
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        },
      ]}
      {...rest}
    />
  );
});
