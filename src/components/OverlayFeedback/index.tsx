import { Canvas, Rect, Blur } from '@shopify/react-native-skia'
import { View, useWindowDimensions } from 'react-native'

type OverlayFeedback = {
    color: string
}

export function OverlayFeedback({ color }: OverlayFeedback) {
    const { width, height } = useWindowDimensions()
    return (
        <View style={{ width, height, position: 'absolute' }}>
            <Canvas
                style={{ flex: 1 }}
            >
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    color={color}
                >
                    <Blur blur={32} mode='decal'/>
                </Rect>
            </Canvas>
        </View>
    )
}
