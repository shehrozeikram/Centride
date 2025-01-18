import React from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons' // For Ionicons
import FontAwesome from 'react-native-vector-icons/FontAwesome' // For FontAwesome

const { width: screenWidth } = Dimensions.get('window')

const CardComponent = ({ driver }) => {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                {/* Profile and Rating Section */}
                <View style={styles.profileAndRating}>
                    <Image
                        source={
                            driver?.profileImage
                                ? { uri: driver.profileImage }
                                : require('../assets/driver.png') // default image
                        }
                        style={styles.profileImage}
                    />
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>{driver?.rating}</Text>
                        <FontAwesome name='star' size={16} color='#FFD700' />
                    </View>
                    <Text style={styles.driverName}>{driver?.name}</Text>
                </View>

                {/* Rs Section */}
                <View style={styles.rsSection}>
                    <Text style={styles.rsText}>Rs {driver?.bidFare}</Text>
                </View>
            </View>

            {/* Time and Distance */}
            <View style={styles.timeDistanceContainer}>
                <View style={styles.row}>
                    <View style={styles.timeContainer}>
                        <Ionicons name='time' size={16} color='orange' />
                        <Text style={styles.timeText}>
                            {driver?.timeToPickup} mins
                        </Text>
                    </View>
                    <View style={styles.distanceContainer}>
                        <Ionicons name='navigate' size={16} color='skyblue' />
                        <Text style={styles.distanceText}>
                            {driver?.distance} km
                        </Text>
                    </View>
                </View>
            </View>

            {/* Accept and Reject Buttons */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.button, styles.rejectButton]}>
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.acceptButton]}>
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        margin: 8,
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        height: 200, // Set a fixed height for the card to make it smaller
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileAndRating: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    ratingText: {
        fontSize: 14,
        color: '#000',
        marginRight: 3,
    },
    driverName: {
        fontSize: 12,
        color: '#000',
        fontWeight: 'bold',
        marginTop: 3,
    },
    rsSection: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    rsText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    timeDistanceContainer: {
        marginTop: 6,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#000',
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    distanceText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#000',
    },
    buttonsContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        width: '48%',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default CardComponent
