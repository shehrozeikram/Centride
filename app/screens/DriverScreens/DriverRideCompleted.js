import React, { useState, useMemo, useEffect } from 'react'
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Platform,
} from 'react-native'
import Geocoding from 'react-native-geocoding'
import { Rating } from 'react-native-ratings'
import AppDivider from '../../components/AppDivider'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import AppButton from '../../components/AppButton'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import Header from '../../components/Header'
import DriverMap from '../DriverScreens/DriverMap'

Geocoding.init('AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw')

const DriverRideCompleted = ({ navigation, route }) => {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [selectedReward, setSelectedReward] = useState(0)
    const [dropoffAddress, setDropoffAddress] = useState('')
    const [pickupAddress, setPickupAddress] = useState('')
    const rewards = [0, 100, 200, 500]

    const { msgData } = route.params || {}
    console.log('message=_=', msgData)

    // Convert dropoff coordinates to an address
    useEffect(() => {
        if (msgData?.dropoff_lat && msgData?.dropoff_long) {
            fetchDropoffAddress(msgData?.dropoff_lat, msgData?.dropoff_long)
        }
        if (msgData?.pickup_lat && msgData?.pickup_long) {
            fetchPickupAddress(msgData?.pickup_lat, msgData?.pickup_long)
        }
    }, [msgData])

    const fetchDropoffAddress = async (latitude, longitude) => {
        try {
            const json = await Geocoding.from(latitude, longitude)
            if (json.results.length > 0) {
                setDropoffAddress(json.results[0].formatted_address)
            } else {
                setDropoffAddress('Address not found')
            }
        } catch (error) {
            console.error('Error fetching drop-off address:', error)
            setDropoffAddress('Error fetching address')
        }
    }

    const fetchPickupAddress = async (latitude, longitude) => {
        try {
            const json = await Geocoding.from(latitude, longitude)
            if (json.results.length > 0) {
                setPickupAddress(json.results[0].formatted_address)
            } else {
                setPickupAddress('Address not found')
            }
        } catch (error) {
            console.error('Error fetching pickup address:', error)
            setPickupAddress('Error fetching address')
        }
    }

    const handleSubmit = () => {
        console.log('User rating:', rating)
        // navigation.navigate('RiderMap')
        navigation.navigate('DriverMap')
    }

    const onBackPress = () => {
        navigation.goBack()
    }

    return (
        <View style={[Style.container]}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={
                            msgData?.rider_image?.uri
                                ? {
                                      uri: msgData?.rider_image?.uri,
                                  } // Use the provided URI if it exists
                                : require('../../assets/driver.png')
                        }
                        style={styles.image}
                    />
                    {/* <Spacing val={20} /> */}
                    <Text style={styles.title}>{msgData?.rider_name}</Text>
                </View>

                <Rating
                    type='star'
                    ratingCount={5}
                    imageSize={30}
                    // showRating
                    onFinishRating={setRating}
                    style={styles.rating}
                />
                <Spacing val={10} />
                <View style={styles.horizontalLine} />
                {/* <AppDivider /> */}

                <View style={styles.distanceContainer}>
                    <Spacing val={10} />
                    <LocationDetail
                        iconSource={require('../../assets/pick-up2.png')}
                        label={pickupAddress || 'Pickup Address not available'}
                    />

                    <View style={styles.verticalLine} />

                    {/* <Spacing val={10} /> */}
                    <LocationDetail
                        iconSource={require('../../assets/waypoint.png')}
                        label={
                            dropoffAddress || 'Dropoff Address not available'
                        }
                    />
                    <Spacing val={10} />
                </View>

                <View style={styles.horizontalLine} />
                {/* <AppDivider /> */}
                <Spacing val={10} />
                <Text
                    style={[
                        Style.fontSemiBold,
                        Style.label14,
                        Style.colorGray,
                    ]}>
                    Total Fare
                </Text>
                <Spacing val={10} />
                <Text
                    style={[Style.fontBold, Style.heading32, Style.colorBlack]}>
                    Rs {msgData?.bid_fare}
                </Text>
                <Spacing val={10} />
                <View style={styles.horizontalLine} />
                <RideInfo />
                <Spacing val={10} />

                {/* <AppDivider />
                <Spacing val={15} />
                <RewardSection />
                <Spacing val={15} />
                <AppDivider />
                <Spacing val={15} />
                <PaymentSection />
                <Spacing val={15} />
                <AppDivider />
                <Spacing val={10} />
                <Text style={[Style.fontBold, Style.label, Style.colorBlack]}>
                    Reward your driver
                </Text>  */}
                {/* <Spacing val={10} /> */}
                {/* <View style={styles.inputView}>
                    <TextInput
                        style={[
                            Style.fontMedium,
                            Style.colorBlack,
                            Style.textCenter,
                        ]}
                        placeholder='Comment on your ride experience'
                        value={comment}
                        onChangeText={setComment}
                        placeholderTextColor='rgba(0,0,0,0.6)'
                    />
                </View>
                <Spacing val={10} /> */}
                <View style={styles.horizontalLine} />
                <View style={styles.buttonView}>
                    <AppButton onPress={handleSubmit} name='Submit' />
                </View>
                <Spacing val={40} />
            </ScrollView>
        </View>
    )
}

const LocationDetail = ({ iconSource, label }) => (
    <View style={styles.locationDetail}>
        <Image source={iconSource} style={styles.locationIcon} />
        <Text
            style={[Style.subTitle, Style.colorBlack, Style.label14]}
            numberOfLines={1}
            ellipsizeMode='tail'>
            {label}
        </Text>

        {/* <Text style={[Style.subTitle, Style.colorBlack, Style.label14]}>
            {label}
        </Text> */}
    </View>
)

const RideInfo = () => (
    <View style={styles.infoContainer}>
        <InfoItem
            icon={<FontAwesome name='arrows-h' size={20} color='#49B5C1' />}
            label='Distance'
            value='3.89KM'
        />
        <InfoItem
            icon={<Ionicons name='time' size={20} color='#F7BC07' />}
            label='Time'
            value='8Min 48Sec'
        />
        <InfoItem
            icon={<MaterialIcons name='discount' size={20} color='#8AC951' />}
            label='Discount'
            value='0%'
        />
    </View>
)

const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
        <View style={[Style.flexRow, Style.alignCenter, Style.gap5]}>
            {icon}
            <Text style={[Style.fontMedium, Style.label14, Style.colorBlack]}>
                {label}
            </Text>
        </View>
        <Spacing val={5} />
        <Entypo
            name='arrow-down'
            size={20}
            color='#49B5C1'
            style={styles.iconInside}
        />
        <Spacing val={5} />
        <Text style={[Style.fontBold, Style.label14, Style.colorBlack]}>
            {value}
        </Text>
    </View>
)

const RewardSection = () => (
    <View style={styles.rewardContainer}>
        <Text style={styles.rewardText}>Reward Points Earned</Text>
        <View style={styles.coinContainer}>
            <Image
                source={require('../../assets/coin.png')}
                style={styles.coinImage}
            />
            <Text style={styles.pointsText}>0.6 pts</Text>
        </View>
    </View>
)

const PaymentSection = () => (
    <View style={styles.paymentContainer}>
        <Text style={styles.paymentText}>Payment method</Text>
        <View style={styles.cashContainer}>
            <Text style={styles.cashText}>Cash</Text>
            <Image
                source={require('../../assets/cash.png')}
                style={styles.coinImage}
            />
        </View>
    </View>
)

const styles = StyleSheet.create({
    scrollContainer: {
        // paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    horizontalLine: {
        width: '90%',
        height: 1,
        backgroundColor: '#E1E1E1', // Change the color as per your preference
        // marginVertical: 10, // Adjust the spacing around the line if needed
    },
    verticalLine: {
        width: 2,
        height: 24,
        backgroundColor: 'black',
        marginHorizontal: 30,
    },
    imageContainer: {
        // marginBottom: -15,
    },
    image: {
        // marginTop: 50,
        width: 90,
        height: 90,
        borderRadius: 75,
    },
    title: {
        fontSize: 20,
        fontWeight: '300',
        marginBottom: 20,
        // marginTop: -5,
        textAlign: 'center',
    },
    rating: {
        marginBottom: 10,
    },
    distanceContainer: {
        marginTop: 5,
    },
    locationDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '88%',
    },
    locationIcon: {
        width: 30,
        height: 30,
        marginLeft: 16,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 20,
    },
    infoItem: {
        alignItems: 'center',
    },
    infoValue: {
        fontWeight: '700',
        marginTop: 10,
    },
    rewardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        // marginTop: 20,
    },
    rewardText: {
        fontSize: 16,
        fontWeight: '700',
    },
    coinContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    coinImage: {
        width: 30,
        height: 30,
    },
    pointsText: {
        fontSize: 16,
        fontWeight: '600',
    },
    paymentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    paymentText: {
        fontSize: 16,
        fontWeight: '700',
    },
    cashContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    cashText: {
        fontSize: 16,
        fontWeight: '600',
    },
    rewardDriverContainer: {
        flexDirection: 'row',
        marginTop: 25,
        width: '90%',
        justifyContent: 'space-between',
    },
    rewardDriver: {
        width: 60,
        // height: 40,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#E1E1E1',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardDriverSelected: {
        backgroundColor: '#49B5C1',
    },
    rewardDriverNumber: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    inputView: {
        width: '90%',
        height: 45,
        backgroundColor: '#F4F4F4',
        marginTop: 20,
        borderRadius: 8,
        justifyContent: 'center',
    },
    input: {
        fontSize: 14,
    },
    buttonView: {
        width: '80%',
        marginTop: 30,
    },
})

export default DriverRideCompleted
