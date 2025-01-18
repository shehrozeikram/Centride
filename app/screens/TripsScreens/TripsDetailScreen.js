import React from 'react'
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const TripsDetailScreen = ({ route }) => {
    const item = route.params.item
    console.log(
        '======================Item in Trips detail========================',
        route.params.item.bookingId,
    )

    const tripDetails = [
        {
            icon: 'clock-o',
            label: 'Pick Up Time',
            text: item.pickUpTime || 'N/A',
        },
        {
            icon: 'road',
            label: 'Trip Distance',
            text: item.tripDistance || 'N/A',
        },
        {
            icon: 'hourglass-1',
            label: 'Trip Duration',
            text: item.tripDuration || 'N/A',
        },
        { icon: 'car', label: 'Vehicle Type', text: item.vehicleType || 'N/A' },
    ]

    const paymentDetails = [
        { icon: 'money', text: item?.cost || 'N/A' },
        { icon: 'ticket', text: 'Coupon: SAVE10' },
        { icon: 'credit-card', text: `Payment Method: ${item.paymentType}` },
    ]

    return (
        <View style={styles.container}>
            {/* Main Card */}
            <ScrollView style={styles.card}>
                {/* Vehicle Info */}
                <View style={styles.vehicleInfo}>
                    <Image
                        source={{ uri: item?.driverImage }}
                        style={styles.carImage}
                    />
                    <View style={styles.detailsContainer}>
                        <Text style={styles.carName}>{item?.driverName}</Text>
                        <Text style={styles.detailText}>Ratings: ⭐⭐⭐⭐</Text>
                        <Text style={styles.detailText}>Color: Red</Text>
                        <Text style={styles.detailText}>Number: ABC-1234</Text>
                    </View>
                </View>
                <View style={styles.divider} />

                {/* Trip Details */}
                <View style={styles.row}>
                    <FontAwesome
                        name='map-marker'
                        size={22}
                        style={[styles.icon, { color: '#FF5733' }]} // Color for Pickup Location
                    />
                    <View style={styles.detailContainer}>
                        <Text style={styles.labelText}>Pickup Location</Text>
                        <Text style={styles.detailText}>
                            {item.pickUpLocation}
                        </Text>
                    </View>
                </View>
                <View style={styles.lightDivider} />
                <View style={styles.row}>
                    <FontAwesome
                        name='map-marker'
                        size={22}
                        style={[styles.icon, { color: '#33FF57' }]} // Color for Dropoff Location
                    />
                    <View style={styles.detailContainer}>
                        <Text style={styles.labelText}>Dropoff Location</Text>
                        <Text style={styles.detailText}>
                            {item.dropOffLocation}
                        </Text>
                    </View>
                </View>
                <View style={styles.divider} />

                {/* Other Trip Details */}
                {tripDetails.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.row,
                            {
                                justifyContent:
                                    index % 2 === 0 ? 'flex-start' : 'flex-end',
                            },
                        ]}>
                        <FontAwesome
                            name={item.icon}
                            size={22}
                            style={[
                                styles.icon,
                                { color: getIconColor(item.icon) },
                            ]} // Use color mapping
                        />
                        <View style={styles.detailContainer}>
                            <Text style={styles.labelText}>{item.label}</Text>
                            <Text style={styles.detailText}>{item.text}</Text>
                        </View>
                    </View>
                ))}
                <View style={styles.divider} />

                {/* Comfort Features */}
                <View style={styles.centeredContainer}>
                    <Image
                        source={{ uri: item?.carImage }}
                        style={styles.featureImage}
                    />
                    <Text style={styles.detailText}>{item.rideType}</Text>
                </View>
                <View style={styles.divider} />

                {/* Payment Details */}
                {paymentDetails.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <FontAwesome
                            name={item.icon}
                            size={22}
                            style={[styles.icon, { color: '#3498DB' }]} // Color for Payment Details
                        />
                        <Text style={styles.detailText}>{item.text}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

// Color mapping function for trip details
const getIconColor = (iconName) => {
    switch (iconName) {
        case 'clock-o':
            return '#3498DB' // Blue for Pick Up Time
        case 'road':
            return '#E74C3C' // Red for Trip Distance
        case 'hourglass-1':
            return '#9B59B6' // Purple for Trip Duration
        case 'car':
            return '#2ECC71' // Green for Vehicle Type
        default:
            return '#007BFF' // Default color
    }
}

// const tripDetails = [
//     { icon: 'clock-o', label: 'Pick Up Time', text: item.pickUpTime || 'N/A' },
//     { icon: 'road', label: 'Trip Distance', text: item.tripDistance || 'N/A' },
//     {
//         icon: 'hourglass-1',
//         label: 'Trip Duration',
//         text: item.tripDuration || 'N/A',
//     },
//     { icon: 'car', label: 'Vehicle Type', text: item.vehicleType || 'N/A' },
// ]

const paymentDetails = [
    { icon: 'money', text: 'Fare: $20.00' },
    { icon: 'ticket', text: 'Coupon: SAVE10' },
    { icon: 'credit-card', text: 'Payment Method: Credit Card' },
]

const styles = StyleSheet.create({
    container: {
        marginTop: '15%',
        flex: 1,
        width: '100%', // Full width for the container
        backgroundColor: '#F7F9FC', // Light gray background
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginBottom: 20,
        width: '100%', // Full width for the card
        alignSelf: 'center', // Center align in the parent
    },
    vehicleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    carImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 15,
    },
    detailsContainer: {
        flex: 1,
    },
    carName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#007BFF',
    },
    detailText: {
        fontSize: 16,
        color: '#555',
        marginVertical: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Aligns items at the start
        marginVertical: 5,
    },
    icon: {
        marginRight: 10,
    },
    detailContainer: {
        flex: 1,
        marginLeft: 5,
    },
    labelText: {
        fontSize: 14,
        color: '#777',
        marginBottom: 3, // Space between label and value
    },
    featureImage: {
        width: 120, // Adjusted width
        height: 90, // Adjusted height
        // borderRadius: 10,
        // marginVertical: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#dcdcdc',
        marginVertical: 10,
    },
    lightDivider: {
        height: 1,
        backgroundColor: '#eaeaea', // Lighter color for the divider
        marginVertical: 5,
    },
    centeredContainer: {
        alignItems: 'center', // Center items in this container
    },
})

export default TripsDetailScreen
