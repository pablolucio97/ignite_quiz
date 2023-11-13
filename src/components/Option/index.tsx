import {
  Canvas,
  Circle,
  Path,
  Skia,
  runTiming,
  useValue
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native';
import { THEME } from '../../styles/theme';
import { styles } from './styles';

type Props = TouchableOpacityProps & {
  checked: boolean;
  title?: string;
}

const CHECK_SIZE = 28;
const CHECK_STROKE = 2;
const RADIUS = (CHECK_SIZE - CHECK_STROKE) / 2
const CENTER_CIRCLE = RADIUS / 2

const circlePath = Skia.Path.Make()
circlePath.addCircle(CHECK_SIZE, CHECK_SIZE, RADIUS)

export function Option({ checked, title, ...rest }: Props) {

  const animatedPercentage = useValue(0)
  const animatedCircle = useValue(0)

  useEffect(() => {
    if (checked) {
      runTiming(animatedPercentage, 1, { duration: 640 })
      runTiming(animatedCircle, CENTER_CIRCLE, { duration: 400 })
    } else {
      runTiming(animatedPercentage, 0, { duration: 640 })
      runTiming(animatedCircle, 0, { duration: 400 })
    }
  }, [checked])

  return (
    <TouchableOpacity
      style={
        [
          styles.container,
          checked && styles.checked
        ]
      }
      {...rest}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      <Canvas style={{ height: CHECK_SIZE * 2, width: CHECK_SIZE * 2 }}>
        <Path
          path={circlePath}
          color={THEME.COLORS.GREY_500}
          style="stroke"
          strokeWidth={CHECK_STROKE}
        />
        <Circle
          cx={CHECK_SIZE}
          cy={CHECK_SIZE}
          r={animatedCircle}
          color={THEME.COLORS.BRAND_LIGHT}
        />
        <Path
          path={circlePath}
          color={THEME.COLORS.BRAND_LIGHT}
          style="stroke"
          strokeWidth={CHECK_STROKE}
          start={0}
          end={animatedPercentage}
        />
      </Canvas>
    </TouchableOpacity >
  );
}