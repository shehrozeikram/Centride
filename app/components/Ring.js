import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    withDelay,
    withRepeat,
} from 'react-native-reanimated'
import Color from '../utils/Color'

const Ring = ({ delay, position }) => {
    const ring = useSharedValue(0)

    const style = useAnimatedStyle(() => {
        return {
            opacity: 0.8 - ring.value,
            transform: [
                {
                    scale: interpolate(ring.value, [0, 1], [0, 4]), // Increased scale
                },
            ],
            position: 'absolute',
            left: position.x - 75, // Adjusted for larger size
            top: position.y - 75, // Adjusted for larger size
        }
    })

    useEffect(() => {
        ring.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, {
                    duration: 2000,
                }),
                -1,
            ),
        )
    }, [])

    return (
        <Animated.View style={[styles.ring, style]}>
            <View style={styles.innerRing} />
            <View style={styles.outerRing} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    ring: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10, // Enhanced shadow for Android
        shadowColor: '#f8f8f8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    innerRing: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
        borderWidth: 15,
        borderColor: Color.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    outerRing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 75,
        borderWidth: 5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        opacity: 0.5,
        transform: [{ scale: 1.2 }], // Slightly larger than inner ring for effect
    },
})

export default Ring
