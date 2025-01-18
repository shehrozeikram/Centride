// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import Color from '../../utils/Color'

// export default function PreRide() {
//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>How to Get Txyco Support</Text>

//             <View style={styles.bulletContainer}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.bulletText}>Be confident in your choice</Text>
//             </View>

//             <View style={styles.bulletContainer}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.bulletText}>Click the menu icon.</Text>
//             </View>

//             <View style={styles.bulletContainer}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.bulletText}>
//                     Click the Support option from the list.
//                 </Text>
//             </View>

//             <View style={styles.bulletContainer}>
//                 <Text style={styles.bullet}>•</Text>
//                 <Text style={styles.bulletText}>
//                     Get the desired support from our staff.
//                 </Text>
//             </View>
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         // justifyContent: 'center',
//         alignItems: 'flex-start',
//         padding: 20,
//         backgroundColor: '#fff', // White background for better contrast
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: 'black',
//         marginBottom: 20,
//     },
//     bulletContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 10,
//     },
//     bullet: {
//         fontSize: 50,
//         // color: '#3E2723',
//         color: Color.primary,
//         marginRight: 10,
//     },
//     bulletText: {
//         fontSize: 20,
//         color: 'black', // Slightly lighter brown for the text
//         lineHeight: 25,
//         fontWeight: '400',
//     },
// })

import React from 'react'
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
} from 'react-native'
import Color from '../../utils/Color'

import { useTranslation } from 'react-i18next'

export default function PreRide({ navigation }) {
    const { t, i18n } = useTranslation()
    const handleNext = () => {
        // Handle Next button press (e.g., navigate to another screen)
        console.log('Next pressed')
    }

    return (
        <View style={styles.container}>
            {/* Bold text in separate lines */}
            <Text style={styles.title}>{t('pre_ride_title_1')}</Text>
            <Text style={styles.title}>{t('pre_ride_title_2')}</Text>
            <Text style={styles.title}>{t('pre_ride_title_3')}</Text>
            <Text style={styles.title}>{t('pre_ride_title_4')}</Text>

            {/* Next Button */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff', // White background for better contrast
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold', // Bold text
        color: 'black',
        marginBottom: 10, // Space between each line
        textAlign: 'center', // Center align each line of text
    },
    nextButton: {
        position: 'absolute',
        bottom: 20, // Position it at the bottom of the screen
        left: 24,
        right: 24,
        backgroundColor: Color.primary,
        paddingVertical: 16, // Increased height of the button
        paddingHorizontal: 40, // Increased width of the button
        borderRadius: 10,
        alignItems: 'center',
    },
    nextText: {
        color: 'white',
        fontSize: 18, // Larger font for the button text
        fontWeight: '600',
    },
})
