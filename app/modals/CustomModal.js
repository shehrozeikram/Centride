import React, { useState, useRef, useEffect } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    Image,
    StyleSheet,
    Dimensions,
    PanResponder,
    Animated,
    Pressable,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import OfferModal from './OfferModal'
import { setSessionId } from '../utils/common'
import { useSelector } from 'react-redux'
import { Post } from '../network/network'
import Spacing from '../components/Spacing'
import Style from '../utils/Styles'
import Color from '../utils/Color'

const { height: screenHeight } = Dimensions.get('window')

const CustomModal = ({
    visible,
    onClose,
    navigation,
    onBook,
    onSelectItem,
}) => {
    const [expanded, setExpanded] = useState(true) // Start as expanded by default
    const [selectedOption, setSelectedOption] = useState(null)
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [updatedPrice, setUpdatedPrice] = useState(null)
    const [carsArray, setCarsArray] = useState([])
    const [showCashContainer, setShowCashContainer] = useState(true)
    const [previousSelectedOption, setPreviousSelectedOption] = useState(null)

    const animatedHeight = useRef(
        new Animated.Value(screenHeight * 0.7),
    ).current
    const scales = useRef({
        selected: new Animated.Value(1),
        unselected: new Animated.Value(1),
    }).current

    useEffect(() => {
        Animated.timing(scales.unselected, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()

        if (selectedOption) {
            // First two bounces: scaling in and out
            Animated.sequence([
                // Zoom out: return to normal size
                Animated.timing(scales.selected, {
                    toValue: 1, // Back to normal size
                    duration: 300,
                    useNativeDriver: true,
                }),
                // Second bounce: zoom in again
                Animated.timing(scales.selected, {
                    toValue: 1.2, // Slight zoom in again
                    duration: 300,
                    useNativeDriver: true,
                }),
                // Zoom out again: back to normal size
                Animated.timing(scales.selected, {
                    toValue: 1, // Normal size again
                    duration: 300,
                    useNativeDriver: true,
                }),
                // Third bounce: zoom in significantly
                Animated.timing(scales.selected, {
                    toValue: 1.3, // Larger zoom
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [selectedOption])

    const handleExpand = () => {
        setExpanded(true)
        Animated.spring(animatedHeight, {
            toValue: screenHeight * 0.8,
            friction: 7, // Increased friction for more bounce
            tension: 70, // Increased tension for more bounce
            useNativeDriver: false,
        }).start()
    }

    const handleCollapse = () => {
        setExpanded(false)
        Animated.spring(animatedHeight, {
            toValue: screenHeight * 0.7,
            friction: 7, // Increased friction for more bounce
            tension: 70, // Increased tension for more bounce
            useNativeDriver: false,
        }).start()
    }

    // const handleOptionSelect = (option) => {
    //     onSelectItem(option)
    //     setSelectedOption(option)
    //     setUpdatedPrice(null)

    //     // Automatically expand the modal when an option is selected
    //     setExpanded(true)

    //     // Move selected option to the top
    //     const updatedCarsArray = carsArray.filter(
    //         (item) => item.id !== option.id,
    //     )
    //     setCarsArray([option, ...updatedCarsArray])
    // }

    const handleOptionSelect = (option) => {
        onSelectItem(option)

        // Track the previously selected option
        setPreviousSelectedOption(selectedOption)

        // Set the current selected option
        setSelectedOption(option)
        setUpdatedPrice(null)

        // Automatically expand the modal when an option is selected
        setExpanded(true)

        // Move selected option to the top
        const updatedCarsArray = carsArray.filter(
            (item) => item.id !== option.id,
        )
        setCarsArray([option, ...updatedCarsArray])
    }

    const handleOfferModalClose = (newPrice) => {
        setShowOfferModal(false)
        if (newPrice) {
            setUpdatedPrice(newPrice)
        }
    }

    const renderOption = ({ item, index }) => {
        const isSelected = selectedOption && selectedOption.id === item.id
        const animatedStyle = {
            transform: [
                { scale: isSelected ? scales.selected : scales.unselected }, // Apply scaling to selected option
            ],
        }
        const image = item?.ride_img.replace('..', 'https://appserver.txy.co')

        // Conditional styles for the price and shadow effect
        const priceStyle = isSelected
            ? styles.selectedPriceText
            : styles.defaultPriceText
        const priceContainerStyle = isSelected
            ? styles.selectedPriceContainer
            : {}

        return (
            <TouchableOpacity
                style={[
                    styles.optionContainer,
                    isSelected && styles.selectedOption,
                    index === carsArray.length - 1 && { borderBottomWidth: 0 }, // Remove border for last item
                ]}
                onPress={() => handleOptionSelect(item)}>
                <Animated.Image
                    resizeMode={'contain'}
                    source={{ uri: item?.image ?? image }}
                    style={[styles.optionImage, animatedStyle]} // Apply the animated scaling
                />
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{item?.ride_type}</Text>
                    <Spacing />
                    <View style={styles.row}>
                        <FontAwesome name='users' size={14} color='black' />
                        <Text style={styles.optionSeats}>{item.num_seats}</Text>
                    </View>
                </View>
                <View style={priceContainerStyle}>
                    <Text style={priceStyle}>{item?.npickup_cost}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // limit swipe within bounds
                if (
                    gestureState.dy < -20 &&
                    gestureState.dy > -screenHeight * 0.3
                ) {
                    animatedHeight.setValue(
                        screenHeight * 0.7 + gestureState.dy,
                    )
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -50) {
                    handleExpand()
                } else if (gestureState.dy > 50) {
                    handleCollapse()
                }
            },
        }),
    ).current

    const user = useSelector((state) => state?.user?.user)
    const [result, setResult] = useState([])

    useEffect(() => {
        getSession()
    }, [])

    const getSession = async () => {
        const firstData = {
            action: 'checkLoginStatus',
            timezone: 'Asia/Karachi',
            platform: Platform.OS,
            display_lang: 'en',
        }

        Post({ data: firstData })
            .then((firstResponse) => {
                const carData =
                    firstResponse?.tariff_data?.result[user?.route_id]?.cars
                setCarsArray(carData)
                setResult(firstResponse?.tariff_data?.result)
                setSessionId(firstResponse?.sess_id)
            })
            .catch((error) => {
                console.error('Error:', error)
                Alert.alert('Error', 'An error occurred. Please try again.')
            })
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            animationType='slide'>
            <Pressable onPress={onClose} style={styles.modalContainer}>
                <Animated.View
                    style={[styles.modalContent, { height: animatedHeight }]}
                    {...panResponder.panHandlers}>
                    {/* Swipe handle at the top */}
                    <View style={styles.swipeHandle} />

                    <Text style={styles.swipeText}>Swipe to view options</Text>
                    <FlatList
                        data={expanded ? carsArray : carsArray.slice(0, 4)} // Show all options if expanded, otherwise show 4 options
                        renderItem={renderOption}
                        keyExtractor={(item) => item.id}
                        extraData={selectedOption}
                    />
                    {showCashContainer && selectedOption && (
                        <View style={styles.cashContainer}>
                            <Image
                                source={require('../assets/cash.png')}
                                style={styles.cashImage}
                            />
                            <View style={styles.cashDetails}>
                                <Text style={styles.cashTitle}>Cash </Text>
                                <Text style={styles.selectedPrice}>
                                    {updatedPrice || selectedOption.price}
                                </Text>
                                <TouchableOpacity
                                    style={styles.offerContainer}
                                    onPress={() => setShowOfferModal(true)}>
                                    <Text style={styles.offerText}>
                                        Offer Your Fare
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <FontAwesome
                                name='chevron-right'
                                size={20}
                                color='#000'
                            />
                        </View>
                    )}
                    {/* {selectedOption && (
                        <View style={styles.cashContainer}>
                            <Image
                                source={require('../assets/cash.png')}
                                style={styles.cashImage}
                            />
                            <View style={styles.cashDetails}>
                                <Text style={styles.cashTitle}>Cash </Text>
                                <Text style={styles.selectedPrice}>
                                    {updatedPrice || selectedOption.price}
                                </Text>
                                <TouchableOpacity
                                    style={styles.offerContainer}
                                    onPress={() => setShowOfferModal(true)}>
                                    <Text style={styles.offerText}>
                                        Offer Your Fare
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <FontAwesome
                                name='chevron-right'
                                size={20}
                                color='#000'
                            />
                        </View>
                    )} */}
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => {
                            onBook()
                        }}>
                        <Text style={styles.bookButtonText}>
                            Book {selectedOption ? selectedOption.type : ''}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Pressable>
            <OfferModal
                visible={showOfferModal}
                onClose={handleOfferModalClose}
                selectedPrice={updatedPrice || selectedOption?.price || 'Rs 0'}
            />
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    swipeHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 10,
        alignSelf: 'center',
        marginVertical: 10,
    },
    swipeText: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
        color: '#888',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 6, // Reduced horizontal padding for compactness
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
    },
    optionImage: {
        width: 80,
        height: 50,
        marginRight: 10,
    },
    optionTextContainer: {
        flex: 1,
        marginLeft: '15%',
    },
    optionTitle: {
        fontSize: 12, // Reduced font size to make the title more compact
        fontWeight: '500',
        color: 'black',
    },
    optionPrice: {
        fontSize: 14, // Reduced font size to make the price more compact
        fontWeight: 'bold',
        color: '#000',
    },
    bookButton: {
        backgroundColor: Color.primary,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cashContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingVertical: 2,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#f1f1f1',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    cashImage: {
        width: 40,
        height: 40,
        marginRight: 5,
    },
    cashDetails: {
        flex: 1,
        alignItems: 'center',
    },
    cashTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 2,
    },
    selectedPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    optionSeats: {
        fontSize: 14,
        marginLeft: 4, // small gap between icon and text
        color: 'black',
    },

    offerContainer: {
        backgroundColor: Color.primary,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    offerText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    swipeText: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
        color: '#888',
    },
    selectedOption: {
        backgroundColor: Color.primary,
        // borderRadius: 10,
        borderLeftColor: '#ff8c00',
        borderLeftWidth: 10,
        paddingLeft: 10,
        marginLeft: -10,
    },
    selectedPriceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // White color for selected price
    },
    defaultPriceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000', // Default black color
    },
})

export default CustomModal
