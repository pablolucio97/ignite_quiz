import { Pressable, Text, TouchableOpacityProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useEffect } from 'react';
import { styles } from './styles';

type Props = TouchableOpacityProps & {
  title: string;
  type: 'EASY' | `MEDIUM` | `HARD`
  isChecked?: boolean;
}

export function Level({title, isChecked = false, type, ...rest }: Props) {

  const isCheckedSharedValue = useSharedValue(1)

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        isCheckedSharedValue.value,
        [0, 1],
        ['red', 'yellow']
      )
    }
  })

  useEffect(() => {
    isCheckedSharedValue.value = withTiming(isChecked ? 1 : 0);
  }, [isChecked])

  return (
    <Pressable
      {...rest}>
      <Animated.View style={
        [
          styles.container,
          animatedCheckStyle,
        ]
      }>
        <Text>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}