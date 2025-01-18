import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import Header from '../../components/Header'
import TripTabs from '../TripsScreens/TripTabs'
import { Post } from '../../network/network'
import HTMLParser from 'react-native-html-parser'

const Trips = () => {
    const navigation = useNavigation()
    const [completedBookings, setCompletedBookings] = useState([])
    const [pendingBookings, setPendingBookings] = useState([])
    const [canceledBookings, setCanceledBookings] = useState([])
    const onBackPress = () => {
        navigation.goBack()
    }
    useEffect(() => {
        setTimeout(() => {
            getBookings()
        }, 1000)
    }, [])
    const getBookings = () => {
        const data = {
            action: 'getbookings',
        }
        Post({ data: data })
            .then((response) => {
                const completedArray = convertHTMLToJSON(response.booking_comp)
                const pendingArray = convertHTMLToJSON2(response.pend_onride)
                const canceledArray = convertHTMLToJSON(response.booking_canc)

                console.log('pendingArr=============>', pendingArray)
                setCompletedBookings(completedArray)
                setPendingBookings(pendingArray)
                setCanceledBookings(canceledArray)
            })
            .catch((error) => {
                console.log(
                    '======error====NjFjNGkydnFqM2xmcDNxdXZ2YzBxaHFzdjU=',
                    error,
                )
            })
    }
    const convertHTMLToJSON2 = (htmlString) => {
        if (!htmlString) return [] // Handle empty HTML string

        const parser = new HTMLParser.DOMParser()
        const doc = parser.parseFromString(htmlString, 'text/html')

        // Extract the list items (each booking item)
        const listItems = doc.getElementsByTagName('ons-list-item')

        // Convert NodeList to Array
        const listArray = Array.from(listItems)
        const bookings = []

        listArray.forEach((item) => {
            const booking = {
                bookingId: item.getAttribute('id')?.split('-')[2], // Extracts the booking ID from the 'id' attribute
                time: item
                    .getElementsByClassName('list-item__title')[0]
                    ?.textContent.trim(), // Extracts time
                status: item
                    .getElementsByTagName('span')[0]
                    ?.textContent.trim(), // Extracts status (e.g., "Pending trip")
                pickUpLocation: item
                    .getElementsByClassName('list-item__subtitle')[0]
                    ?.textContent.trim(), // Pickup location (first subtitle)
                dropOffLocation: item
                    .getElementsByClassName('list-item__subtitle')[1]
                    ?.textContent.trim(), // Dropoff location (second subtitle)
                driverImage: item.getAttribute('data-driverimg'), // Driver image from the 'data-driverimg' attribute
                carImage: item.getAttribute('data-rideimg'), // Car image from the 'data-rideimg' attribute
                cost: item.getAttribute('data-cost'), // Cost from the 'data-cost' attribute
                bookingData: JSON.parse(
                    item.getElementsByClassName('booking-list-item-data')[0]
                        ?.textContent || '{}',
                ), // Parse hidden JSON data from the corresponding <span>
                pickUpTime: formatDateTime(),
            }

            bookings.push(booking)
        })

        return bookings
    }
    function formatDateTime() {
        const now = new Date()

        const options = {
            weekday: 'long', // Full weekday name (e.g., "Thursday")
            year: 'numeric', // Full year (e.g., "2025")
            month: 'short', // Abbreviated month name (e.g., "Jan")
            day: 'numeric', // Day of the month (e.g., "2")
        }

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(
            now,
        )

        // Ensure there's a space between the day and the year
        const dateParts = formattedDate.split(',')
        const dateString = dateParts[0].trim() + ' ' + dateParts[1].trim()

        return dateString
    }

    console.log(formatDateTime())

    const convertHTMLToJSON = (htmlString) => {
        if (!htmlString) return [] // Handle empty HTML string

        const parser = new HTMLParser.DOMParser()
        const doc = parser.parseFromString(htmlString, 'text/html')

        // Extract the list items (each booking item)
        const listItems = doc.getElementsByTagName('ons-list-item')

        // Convert NodeList to Array
        const listArray = Array.from(listItems)
        const bookings = []

        listArray.forEach((item) => {
            const booking = {
                bookingId: item.getAttribute('data-btitle'),
                time: item
                    .getElementsByClassName('list-item__title')[0]
                    ?.textContent.trim(),
                rideType: item.getAttribute('data-ridedesc'),
                driverPhone: item.getAttribute('data-driverphone'),
                paymentType: item.getAttribute('data-ptype'),
                pickUpTime: item.getAttribute('data-put'),
                driverImage: item.getAttribute('data-driverimg'),
                carImage: item.getAttribute('data-rideimg'),
                driverName: item.getAttribute('data-drivername'),
                cost: item.getAttribute('data-cost'),
                pickUpLocation: item.getAttribute('data-pul'),
                dropOffLocation: item.getAttribute('data-dol'),
                status: item
                    .getElementsByTagName('span')[0]
                    ?.textContent.trim(),
                bookingData: JSON.parse(
                    item.getElementsByClassName(
                        `booking-list-item-data-${item.getAttribute('id').split('-').pop()}`,
                    )[0]?.textContent || '{}',
                ),
            }

            bookings.push(booking)
        })

        return bookings
    }
    console.log('pendingBookings======>', pendingBookings)
    return (
        <View style={Style.container}>
            <Spacing val={Platform.OS === 'ios' && 35} />
            <View style={[Style.hPaddingSixteen]}>
                <Header
                    LeftIcon={true}
                    onPressLeftIcon={onBackPress}
                    title={'Trips'}
                />
                <Spacing val={35} />
            </View>

            <TripTabs
                cancelBooking={canceledBookings}
                completeBookings={completedBookings}
                currentBookings={pendingBookings}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: '25%',
        alignItems: 'center',
    },
    mainContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        elevation: 20,
        height: '25%',
        width: '100%',
    },
    recordText: {
        marginTop: '50%',
    },
})

export default Trips
