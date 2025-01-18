import React from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import DriverCard from '../modals/DriverCard' // Import the DriverCard component

const Test = () => {
    const driverRequests = [
        {
            action: 'driver-bid-notify',
            bid_fare: '179.00',
            booking_id: 9060,
            driver_firstname: 'Hamza',
            driver_id: '57',
            pickup_lat: 33.7224523,
            pickup_long: 73.081795,
            dropoff_lat: 33.7077281,
            dropoff_long: 73.0497919,
            time_to_pickup: 10,
            profileImage: 'https://via.placeholder.com/60', // Sample image URL
            rating: 4.5,
        },
        {
            action: 'driver-bid-notify',
            bid_fare: '150.00',
            booking_id: 9061,
            driver_firstname: 'Ali',
            driver_id: '58',
            pickup_lat: 33.7224523,
            pickup_long: 73.081795,
            dropoff_lat: 33.7077281,
            dropoff_long: 73.0497919,
            time_to_pickup: 15,
            profileImage: 'https://via.placeholder.com/60', // Sample image URL
            rating: 4.2,
        },
        {
            action: 'driver-bid-notify',
            bid_fare: '200.00',
            booking_id: 9062,
            driver_firstname: 'Sara',
            driver_id: '59',
            pickup_lat: 33.7224523,
            pickup_long: 73.081795,
            dropoff_lat: 33.7077281,
            dropoff_long: 73.0497919,
            time_to_pickup: 12,
            profileImage: 'https://via.placeholder.com/60', // Sample image URL
            rating: 4.8,
        },
    ]

    const renderItem = ({ item }) => {
        return <DriverCard item={item} />
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={driverRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item.booking_id.toString()}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 10,
    },
})

export default Test
