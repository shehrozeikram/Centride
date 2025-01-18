import React from 'react'
import { StyleSheet, View, Text, FlatList } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import Style from '../../utils/Styles'

import { useTranslation } from 'react-i18next'

const rideData = [
    {
        id: '1',
        date: '2023-09-10',
        day: 'Sunday',
        year: '2023',
        time: '08:00 AM',
        startPlace: 'The Grand Central Station, New York City',
        endPlace: 'Statue of Liberty, Liberty Island, NY',
        status: 'Completed',
    },
    {
        id: '2',
        date: '2023-09-11',
        day: 'Monday',
        year: '2023',
        time: '09:30 AM',
        startPlace: 'Los Angeles International Airport',
        endPlace: 'Hollywood Walk of Fame',
        status: 'Completed',
    },
    {
        id: '3',
        date: '2023-09-12',
        day: 'Tuesday',
        year: '2023',
        time: '10:15 AM',
        startPlace: 'San Francisco International Airport',
        endPlace: 'Golden Gate Bridge',
        status: 'Completed',
    },
    // Add more ride data as needed
]

// const RideItem = ({ item }) => {
//     return (
//         <View style={styles.itemContainer}>
//             <Text
//                 style={styles.dateText}
//             >{`${item.date} (${item.day}, ${item.year})`}</Text>
//             <Text style={styles.timeText}>{item.time}</Text>
//             <View style={styles.placeContainer}>
//                 <FontAwesome name='location-arrow' size={16} color='#4CAF50' />
//                 <Text
//                     style={styles.placeText}
//                     numberOfLines={1}
//                     ellipsizeMode='tail'
//                 >
//                     {item.startPlace}
//                 </Text>
//             </View>
//             <View style={styles.placeContainer}>
//                 <FontAwesome6 name='location-dot' size={16} color='#F44336' />
//                 <Text
//                     style={styles.placeText}
//                     numberOfLines={1}
//                     ellipsizeMode='tail'
//                 >
//                     {item.endPlace}
//                 </Text>
//             </View>
//             <View style={styles.statusContainer}>
//                 <Text style={styles.statusText}>{item.status}</Text>
//             </View>
//         </View>
//     )
// }

const RideItem = ({ item }) => {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.dateText}>
                {/* {`${item?.date} (${item?.day}, ${item?.year})`} */}
                {`${item?.pickUpTime}`}
            </Text>
            <Text style={styles.timeText}>{item?.time}</Text>
            <View style={styles.placeContainer}>
                <FontAwesome name='location-arrow' size={16} color='#4CAF50' />
                <Text
                    style={styles.placeText}
                    numberOfLines={1}
                    ellipsizeMode='tail'>
                    {item?.pickUpLocation}
                </Text>
            </View>
            <View style={styles.placeContainer}>
                <FontAwesome6 name='location-dot' size={16} color='#F44336' />
                <Text
                    style={styles.placeText}
                    numberOfLines={1}
                    ellipsizeMode='tail'>
                    {item?.dropOffLocation}
                </Text>
            </View>
            <View style={styles.statusContainer}>
                <Text style={[styles.statusText, Style.colorWhite]}>
                    {'Current'}
                </Text>
            </View>
        </View>
    )
}
const Current = ({ data }) => {
    const { t, i18n } = useTranslation()
    return (
        <View style={Style.customComponent}>
            <FlatList
                data={data}
                renderItem={RideItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text>{t('no_booking_records')}</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
        marginTop: 50,
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.62,
        elevation: 4,
        margin: 5,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 14,
        color: '#555',
    },
    placeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10, // Add gap between the start and end place
    },
    placeText: {
        fontSize: 18, // Increase text size for places
        color: '#333',
        marginLeft: 8, // Space between icon and text
        flex: 1, // Allow the text to take the available space
    },
    statusContainer: {
        marginTop: 10,
        padding: 5,
        backgroundColor: '#d4edda',
        borderRadius: 5,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#155724',
        fontWeight: 'bold',
    },
})

export default Current
