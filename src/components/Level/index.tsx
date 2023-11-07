import { Pressable, Text, TouchableOpacityProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useEffect } from 'react';
import { styles } from './styles';

type Props = TouchableOpacityProps & {
  isChecked?: boolean;
}

export function Level({isChecked = false, ...rest }: Props) {

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
          Text
        </Text>
      </Animated.View>
    </Pressable>
  );
}