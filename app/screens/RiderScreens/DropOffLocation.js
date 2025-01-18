import React, { useCallback, useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Platform,
    Image,
    Alert,
    StatusBar,
} from 'react-native'
import Geocoder from 'react-native-geocoding'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import AppDivider from '../../components/AppDivider'
import CustomModal from '../../modals/CustomModal'
import Style from '../../utils/Styles'
import Spacing from '../../components/Spacing'
import Header from '../../components/Header'
import Color from '../../utils/Color'
import { getSessionId } from '../../utils/common'
import { RIDER_BASE_URL } from '../../utils/constants'
import axios from 'axios'
import { useRoute } from '@react-navigation/native'
import { Post } from '../../network/network'
import { reloadResources } from 'i18next'
import AppButton from '../../components/AppButton'

Geocoder.init('AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw')

const DATA = [
    {
        id: '1',
        title: 'Blue Area, Islamabad, Pakistan',
        latitude: 33.70499718,
        longitude: 73.050499798,
    },
    {
        id: '2',
        title: 'F-8, Islamabad, Pakistan',
        latitude: 33.6844,
        longitude: 73.0483,
    },
    {
        id: '3',
        title: 'Sadar, Rawalpindi, Pakistan',
        latitude: 33.6018,
        longitude: 73.0782,
    },
]

const Item = ({ item, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.item}>
        <View style={styles.icon}>
            <FontAwesome name='map-marker' size={20} color='#15ABBE' />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.mainText}>{item.title}</Text>
        </View>
        {/* <Text style={styles.distanceText}>6.8 km</Text> */}
    </TouchableOpacity>
)

const DropOffLocation = ({ navigation }) => {
    const route = useRoute()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchQuery2, setSearchQuery2] = useState('')
    const [searchQuery3, setSearchQuery3] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    // const [recentPlaces, setRecentPlaces] = useState(DATA)
    const [recentPlaces, setRecentPlaces] = useState(DATA.slice(0, 5))

    const [showSearchField, setShowSearchField] = useState(false)
    const [picuploactionLatLng, setPickuplocationLatLng] = useState()
    const [dropOffLoactionLatLng, setDropOplocationLatLng] = useState()
    const [stopBetweenRide, setStopBetweenRide] = useState()
    const [routeValue, setRouteValues] = useState('')
    const [userAddress, setUserAddress] = useState('')

    let hideOtherSearchFields = false
    const [predictions, setPredictions] = useState([]) // State to store API predictions

    useEffect(() => {
        // Set the status bar to be translucent, allowing the map to go under it.
        StatusBar.setTranslucent(true)
        StatusBar.setBackgroundColor('transparent')
    }, [])

    useEffect(() => {
        handleRoutes()
    }, [])
    const handleRoutes = () => {
        if (route?.params) {
            setRouteValues(route?.params?.origin)
            setUserAddress(route?.params?.userAddress)
            setSearchQuery(route?.params?.userAddress)
            if (
                route?.params?.origin?.latitude &&
                route?.params?.origin?.longitude
            ) {
                reverseGeocode(
                    route?.params?.origin.latitude,
                    route?.params?.origin.longitude,
                )
            }
        }
    }

    const reverseGeocode = async (latitude, longitude) => {
        try {
            const response = await Geocoder.from(latitude, longitude)
            const address = response.results[0]?.formatted_address
            if (address) {
                setUserAddress(address)
                setSearchQuery(address)
            } else {
                console.log('Address not found')
            }
        } catch (error) {
            console.error('Error in reverse geocoding: ', error)
        }
    }

    // Handler for when the user types into the search field
    const handleSearchQueryChange = (text) => {
        setSearchQuery(text)
        if (text === '') {
            setUserAddress(userAddress || '')
        } else {
            setUserAddress('')
        }
    }

    const handlePlaceSelect = (data, details) => {
        if (!details) {
            console.log('Details are undefined, retrying to fetch details...')
            // Optionally show an alert or message to the user
            Alert.alert('Could not retrieve details. Please try again.')
            return
        }

        if (details) {
            const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
            }
            setDropOplocationLatLng(location)

            setSearchQuery2(details?.formatted_address)
            return
            navigation.navigate('RiderMap', {
                picuploactionLatLng: picuploactionLatLng ?? routeValue,
                dropOffLoactionLatLng: location,
                pickUpAddreess: searchQuery,
                dropOffAddress: searchQuery2,
                secondLocation: location,
                showModal: true,
            })
        }
    }
    const handlePickUpLocation = (data, details) => {
        // Handle the case when details is undefined
        if (!details) {
            console.log('Details are undefined, retrying to fetch details...')
            // Optionally show an alert or message to the user
            Alert.alert('Could not retrieve details. Please try again.')
            return
        }

        if (details) {
            const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
            }
            setPickuplocationLatLng(location)
            setSearchQuery(details?.formatted_address)
        }
    }
    const handleAddAnotherLocation = (data, details) => {
        if (!details) {
            console.log('Details are undefined, retrying to fetch details...')
            // Optionally show an alert or message to the user
            Alert.alert('Could not retrieve details. Please try again.')
            return
        }

        if (details) {
            const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
            }

            setSearchQuery3(details?.formatted_address)
            setStopBetweenRide(location)
            return
            navigation.navigate('RiderMap', {
                picuploactionLatLng: picuploactionLatLng,
                dropOffLoactionLatLng: location,
                stopBetweenRidelatLng: stopBetweenRide,
                pickUpAddreess: searchQuery,
                dropOffAddress: searchQuery2,
                stopBetweenRideAddress: searchQuery3,
                secondLocation: location,
                showModal: true,
            })
        }
    }
    const handleContinue = () => {
        // Check if any required fields are missing
        if (
            // !picuploactionLatLng ||
            !dropOffLoactionLatLng ||
            // !searchQuery ||
            !searchQuery2
        ) {
            // Display an alert if any fields are missing
            Alert.alert(
                'Missing Information',
                'Please make sure all fields are filled out before continuing.',
                [{ text: 'OK' }],
            )
            return // Exit the function if validation fails
        }
        const data = {
            picuploactionLatLng: picuploactionLatLng ?? routeValue,
            dropOffLoactionLatLng: dropOffLoactionLatLng,
            stopBetweenRidelatLng: stopBetweenRide,
            pickUpAddreess: searchQuery || userAddress,
            dropOffAddress: searchQuery2,
            stopBetweenRideAddress: searchQuery3,
            secondLocation: dropOffLoactionLatLng,
            showModal: true,
        }

        navigation.navigate('RiderMap', {
            picuploactionLatLng: picuploactionLatLng ?? routeValue,
            dropOffLoactionLatLng: dropOffLoactionLatLng,
            stopBetweenRidelatLng: stopBetweenRide,
            pickUpAddreess: searchQuery || userAddress,
            dropOffAddress: searchQuery2,
            stopBetweenRideAddress: searchQuery3,
            secondLocation: dropOffLoactionLatLng,
            showModal: true,
        })
    }

    const handleRecentPlacePress = (item) => {
        const location = {
            latitude: item.latitude,
            longitude: item.longitude,
        }
        navigation.navigate('RiderMap', {
            secondLocation: location,
            showModal: true,
        })
    }

    const renderItem = ({ item }) => (
        <Item item={item} onPress={() => handleRecentPlacePress(item)} />
    )

    const renderSuggestion = (data) => (
        <TouchableOpacity
        // onPress={() => handlePickUpLocation(data)}
        >
            <View style={styles.suggestionContainer}>
                <FontAwesome name='map-marker' size={22} color='red' />
                <Text style={styles.suggestionText} numberOfLines={1}>
                    {data.description}
                </Text>
            </View>
        </TouchableOpacity>
    )

    // const onBackPress = () => {
    //     navigation.goBack()
    // }

    return (
        <View style={Style.container}>
            {/* <Spacing val={Platform.OS === 'ios' && 35} /> */}
            <Spacing val={35} />

            <View style={styles.searchBarContainer}>
                <GooglePlacesAutocomplete
                    debounce={10}
                    renderLeftButton={() => (
                        <View style={styles.pickup2ImageContainer}>
                            <Image
                                source={require('../../assets/pick-up-dropoff.png')}
                                style={styles.pickup2Image}
                            />
                        </View>
                    )}
                    placeholder='From'
                    onPress={handlePickUpLocation}
                    query={{
                        key: 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw',
                        language: 'en',
                        radius: 20000,
                        location: '33.6844,73.0479',
                        components: 'country:pk',
                    }}
                    styles={{
                        textInput: styles.searchBar,
                        listView: styles.listView,
                    }}
                    fetchDetails={true}
                    textInputProps={{
                        onChangeText: handleSearchQueryChange,
                        value:
                            searchQuery ||
                            userAddress ||
                            routeValue?.address ||
                            '', // Conditionally set value
                    }}
                    renderRow={(data) => (
                        <View style={styles.suggestionContainer}>
                            <FontAwesome
                                name='map-marker'
                                size={22}
                                color='red'
                            />
                            <Text
                                style={styles.suggestionText}
                                numberOfLines={1}>
                                {data.description}
                            </Text>
                        </View>
                    )}
                />
            </View>
            <Spacing val={15} />

            {!hideOtherSearchFields && (
                <View style={[Style.flexRow, Style.alignStart, Style.gap10]}>
                    <View style={styles.searchBarContainer}>
                        <GooglePlacesAutocomplete
                            debounce={10}
                            placeholder='Where to'
                            onPress={handlePlaceSelect}
                            renderLeftButton={() => (
                                <View style={styles.pickup2ImageContainer}>
                                    <Image
                                        source={require('../../assets/drop-off.png')}
                                        style={styles.pickup2Image}
                                    />
                                </View>
                            )}
                            query={{
                                key: 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw',
                                language: 'en',
                                radius: 20000, // Search within 20 km to cover both Rawalpindi and Islamabad
                                location: '33.6844,73.0479',
                                components: 'country:pk',
                            }}
                            styles={{
                                textInput: styles.searchBar,
                                listView: styles.listView,
                            }}
                            fetchDetails={true}
                            textInputProps={{
                                onChangeText: (text) => {
                                    setSearchQuery2(text)
                                },
                                value: searchQuery2,
                            }}
                            renderRow={(data) => (
                                <View style={styles.suggestionContainer}>
                                    <FontAwesome
                                        name='map-marker'
                                        size={22}
                                        color='red'
                                    />
                                    <Text
                                        style={styles.suggestionText}
                                        numberOfLines={1}>
                                        {data.description}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                    {!hideOtherSearchFields && (
                        <View style={styles.icoStyle}>
                            <FontAwesome
                                name='plus'
                                size={22}
                                color='#FF5722'
                                onPress={() => setShowSearchField(true)}
                            />
                        </View>
                    )}
                </View>
            )}
            <Spacing val={15} />
            {showSearchField && !hideOtherSearchFields && (
                <View style={[Style.flexRow, Style.alignStart, Style.gap10]}>
                    <View style={styles.searchBarContainer}>
                        <GooglePlacesAutocomplete
                            debounce={10}
                            renderLeftButton={() => (
                                <Image
                                    source={require('../../assets/waypoint.png')}
                                    style={styles.pickup2Image}
                                />
                            )}
                            placeholder='Add another location'
                            onPress={handleAddAnotherLocation}
                            query={{
                                key: 'AIzaSyDWptdKEfofkAbIBS2NBFch1dU8lDOb-Iw',
                                language: 'en',
                            }}
                            styles={{
                                textInput: styles.searchBar,
                                listView: styles.listView,
                            }}
                            fetchDetails={true}
                            textInputProps={{
                                onChangeText: (text) => setSearchQuery3(text),
                                value: searchQuery3,
                            }}
                            renderRow={(data) => (
                                <View style={styles.suggestionContainer}>
                                    <FontAwesome
                                        name='map-marker'
                                        size={22}
                                        color='red'
                                    />
                                    <Text
                                        style={styles.suggestionText}
                                        numberOfLines={1}>
                                        {data.description}
                                    </Text>
                                    {/* <Text style={styles.distanceText}>
                                        6.9 km
                                    </Text> */}
                                    {/* Placeholder for distance */}
                                </View>
                            )}
                        />
                    </View>
                    {!hideOtherSearchFields && (
                        <View style={styles.minus}>
                            <FontAwesome
                                name='minus'
                                size={30}
                                color='#FF5722'
                                onPress={() => setShowSearchField(false)}
                            />
                        </View>
                    )}
                </View>
            )}
            <Spacing val={15} />
            <View style={styles.divider}>
                <AppDivider />
            </View>
            <Spacing val={15} />

            {searchQuery2 === '' &&
            searchQuery3 === '' &&
            searchQuery === '' ? (
                <>
                    <Text
                        style={[
                            styles.recentPlacesText,
                            Style.fontLight,
                            Style.colorBlack,
                            // Style.textleft,
                            Style.label,
                        ]}>
                        Recent Places
                    </Text>
                    <Spacing val={16} />
                    <FlatList
                        data={recentPlaces.slice(0, 5)}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.flatListContainer}
                        initialNumToRender={5}
                        maxToRender={10}
                        windowSize={5}
                    />
                </>
            ) : null}
            <View style={styles.buttonView}>
                <AppButton name={'Continue'} onPress={handleContinue} />
            </View>
            <Spacing val={30} />
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    buttonView: {
        width: '80%',
        paddingHorizontal: 20,
        marginHorizontal: 26,
        // marginTop: 30,
    },
    container: {
        flex: 1,
        marginTop: '25%',
        paddingHorizontal: 15,
        backgroundColor: '#F5F5F5',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        width: '84%',
        position: 'relative',
        zIndex: 0,
    },
    searchBar: {
        flex: 1,
        marginLeft: 12,
        borderRadius: 20,
        height: 30,
        paddingLeft: 34, // Make room for the image
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        color: 'black',
    },
    icoStyle: {
        marginTop: 6,
    },
    minus: {
        marginTop: 5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
    },
    textContainer: {
        flex: 1,
        marginHorizontal: 10,
    },
    icon: {
        marginRight: 15,
    },
    distanceText: {
        fontSize: 14,
        fontWeight: '800',
        color: Color.black,
        textAlign: 'right',
        minWidth: 52,
        marginLeft: -10,
    },
    listView: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        elevation: 2,
        paddingVertical: 10,
        marginLeft: 34,
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    mainText: {
        fontSize: 14,
        fontWeight: '300',
        color: 'black',
    },
    recentPlacesText: {
        marginLeft: 20,
    },
    suggestionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionText: {
        flex: 1,
        marginLeft: 14,
        marginRight: 4,
        fontSize: 16,
        color: '#333',
        overflow: 'hidden',
        width: 248,
    },
    pickup2Image: {
        width: 24,
        height: 28,
    },
    pickup2ImageContainer: {
        position: 'absolute',
        left: 18,
        top: '46%',
        transform: [{ translateY: -14 }],
        zIndex: 1,
    },
})

export default DropOffLocation
