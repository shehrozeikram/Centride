import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Color from '../../utils/Color'

import { useTranslation } from 'react-i18next'

export default function TxycoSupport() {
    const { t, i18n } = useTranslation()
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('txyco_support_title')}</Text>

            <View style={styles.bulletContainer}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{t('bullet_point_1')}</Text>
            </View>

            <View style={styles.bulletContainer}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{t('bullet_point_2')}</Text>
            </View>

            <View style={styles.bulletContainer}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{t('bullet_point_3')}</Text>
            </View>

            <View style={styles.bulletContainer}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{t('bullet_point_4')}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 20,
        backgroundColor: '#fff', // White background for better contrast
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 20,
    },
    bulletContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    bullet: {
        fontSize: 50,
        // color: '#3E2723',
        color: Color.primary,
        marginRight: 10,
    },
    bulletText: {
        fontSize: 20,
        color: 'black', // Slightly lighter brown for the text
        lineHeight: 25,
        fontWeight: '400',
    },
})
